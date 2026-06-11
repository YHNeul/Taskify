import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  changePassword,
  updateMyInfo,
  uploadProfileImage,
} from '@/shared/apis/user';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMyInfoQuery } from '@/shared/hooks/useMyInfoQuery';
import {
  PASSWORD_LETTER_AND_NUMBER_ERROR_MESSAGE,
  PASSWORD_TRIPLE_REPEAT_ERROR_MESSAGE,
  validatePasswordHasLetterAndNumber,
  validatePasswordNoTripleRepeat,
} from '@/shared/utils/validate';

const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해 주세요.')
    .max(10, '열 자 이하로 작성해주세요.'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요.'),
    newPassword: z
      .string()
      .min(1, '새 비밀번호를 입력해 주세요.')
      .refine(
        (value) => validatePasswordNoTripleRepeat(value),
        PASSWORD_TRIPLE_REPEAT_ERROR_MESSAGE,
      )
      .min(8, '8자 이상 입력해 주세요.')
      .refine(
        (value) => validatePasswordHasLetterAndNumber(value),
        PASSWORD_LETTER_AND_NUMBER_ERROR_MESSAGE,
      ),
    confirmPassword: z.string().min(1, '새 비밀번호를 한 번 더 입력해 주세요.'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const useMyPageForm = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: myInfo, isLoading } = useMyInfoQuery();

  const initialEmail = myInfo?.email ?? '';
  const initialProfileImageUrl = myInfo?.profileImageUrl ?? null;

  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordServerError, setCurrentPasswordServerError] = useState<
    string | null
  >(null);

  const currentPreviewImageUrl = previewImageUrl ?? initialProfileImageUrl;

  const {
    register: registerProfile,
    handleSubmit: onProfileSubmit,
    reset: resetProfileForm,
    formState: {
      errors: profileErrors,
      isDirty: isProfileNicknameDirty,
      isSubmitting: isProfileSubmitting,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: '',
    },
  });

  const {
    register: registerPassword,
    watch: watchPassword,
    handleSubmit: onPasswordSubmit,
    reset: resetPasswordForm,
    setError: setPasswordFormError,
    clearErrors: clearPasswordFormErrors,
    formState: {
      errors: passwordErrors,
      isValid: isPasswordFormValid,
      isSubmitting: isPasswordSubmitting,
    },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isNicknameChanged = isProfileNicknameDirty;
  const isImageChanged = selectedImageFile !== null;
  const isProfileChanged = isNicknameChanged || isImageChanged;

  const currentPasswordValue = watchPassword('currentPassword');
  const newPasswordValue = watchPassword('newPassword');
  const confirmPasswordValue = watchPassword('confirmPassword');

  const currentPasswordErrorMessage = currentPasswordValue
    ? (currentPasswordServerError ?? passwordErrors.currentPassword?.message)
    : undefined;
  const newPasswordErrorMessage = newPasswordValue
    ? passwordErrors.newPassword?.message
    : undefined;
  const confirmPasswordErrorMessage = confirmPasswordValue
    ? passwordErrors.confirmPassword?.message
    : undefined;

  const uploadProfileImageMutation = useMutation({
    mutationFn: uploadProfileImage,
  });

  const updateMyInfoMutation = useMutation({
    mutationFn: updateMyInfo,
    onSuccess: (updatedMyInfo) => {
      queryClient.setQueryData(QUERY_KEYS.me(), updatedMyInfo);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      openAlert('프로필이 업데이트되었습니다.');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      openAlert('비밀번호가 변경되었습니다.');
      resetPasswordForm();
    },
  });

  useEffect(() => {
    if (!myInfo?.nickname || isProfileNicknameDirty) return;
    resetProfileForm({ nickname: myInfo.nickname });
  }, [myInfo?.nickname, resetProfileForm, isProfileNicknameDirty]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const openAlert = (message: string) => {
    setAlertMessage(message);
  };

  const closeAlert = () => {
    setAlertMessage(null);
  };

  const validateCurrentPassword = async (value: string) => {
    if (!value || !initialEmail) return;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: initialEmail,
          password: value,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        const message = data?.message ?? '현재 비밀번호가 일치하지 않습니다.';
        setCurrentPasswordServerError(message);
        setPasswordFormError('currentPassword', {
          type: 'server',
          message,
        });
        return;
      }

      setCurrentPasswordServerError(null);
      clearPasswordFormErrors('currentPassword');
    } catch {
      // blur 검증 실패는 입력 UX를 방해하지 않기 위해 무시
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setCurrentPasswordServerError(null);
    try {
      await changePasswordMutation.mutateAsync({
        password: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      const unknownError = error as
        | {
            response?: {
              status?: number;
              data?: {
                message?: string;
              };
            };
          }
        | undefined;
      const statusCode = unknownError?.response?.status;
      const serverMessage = unknownError?.response?.data?.message;

      if (
        statusCode === 400 ||
        statusCode === 401 ||
        statusCode === 403 ||
        serverMessage?.includes('비밀번호')
      ) {
        const fieldErrorMessage =
          serverMessage ?? '현재 비밀번호가 일치하지 않습니다.';
        setCurrentPasswordServerError(fieldErrorMessage);
        setPasswordFormError('currentPassword', {
          type: 'server',
          message: fieldErrorMessage,
        });
        return;
      }

      openAlert(serverMessage ?? '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleProfileImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];

    if (!imageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);

    setSelectedImageFile(imageFile);
    setPreviewImageUrl(objectUrl);

    event.target.value = '';
  };

  const handleProfileSubmit = async ({ nickname }: ProfileFormValues) => {
    if (!isProfileChanged) {
      return;
    }

    try {
      let profileImageUrl = currentPreviewImageUrl ?? null;

      if (selectedImageFile) {
        const uploadResult =
          await uploadProfileImageMutation.mutateAsync(selectedImageFile);
        profileImageUrl = uploadResult.profileImageUrl;
      }

      await updateMyInfoMutation.mutateAsync({
        nickname: nickname.trim(),
        profileImageUrl,
      });

      setSelectedImageFile(null);
      setPreviewImageUrl(undefined);
    } catch {
      openAlert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const currentPasswordRegister = registerPassword('currentPassword');

  const handleCurrentPasswordChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    currentPasswordRegister.onChange(event);

    if (currentPasswordServerError) {
      setCurrentPasswordServerError(null);
      clearPasswordFormErrors('currentPassword');
    }
  };

  const handleCurrentPasswordBlur = (event: FocusEvent<HTMLInputElement>) => {
    currentPasswordRegister.onBlur(event);
    void validateCurrentPassword(event.target.value);
  };

  return {
    isLoading,
    initialEmail,
    currentPreviewImageUrl,
    fileInputRef,
    alertMessage,
    closeAlert,
    isProfileChanged,
    isProfileSubmitting,
    profileErrors,
    registerProfile,
    submitProfileForm: onProfileSubmit(handleProfileSubmit),
    handleProfileImageButtonClick,
    handleProfileImageChange,
    isPasswordFormValid,
    isPasswordSubmitting,
    registerPassword,
    currentPasswordRegister,
    handleCurrentPasswordChange,
    handleCurrentPasswordBlur,
    currentPasswordErrorMessage,
    newPasswordErrorMessage,
    confirmPasswordErrorMessage,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    toggleShowCurrentPassword: () => setShowCurrentPassword((prev) => !prev),
    toggleShowNewPassword: () => setShowNewPassword((prev) => !prev),
    toggleShowConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
    submitPasswordForm: onPasswordSubmit(handlePasswordSubmit),
  };
};
