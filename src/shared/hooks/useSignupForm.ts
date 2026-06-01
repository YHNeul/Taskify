'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  PASSWORD_LETTER_AND_NUMBER_ERROR_MESSAGE,
  PASSWORD_TRIPLE_REPEAT_ERROR_MESSAGE,
  validatePasswordHasLetterAndNumber,
  validatePasswordNoTripleRepeat,
} from '@/shared/utils/validate';

type SignupErrors = {
  email: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  agree: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, '이메일을 입력해 주세요.')
      .regex(emailRegex, '이메일 형식으로 작성해 주세요.'),
    nickname: z
      .string()
      .trim()
      .min(1, '닉네임을 입력해 주세요.')
      .max(10, '열 자 이하로 작성해주세요.'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해 주세요.')
      .refine(
        (value) => validatePasswordNoTripleRepeat(value),
        PASSWORD_TRIPLE_REPEAT_ERROR_MESSAGE,
      )
      .min(8, '8자 이상 입력해 주세요.')
      .refine(
        (value) => validatePasswordHasLetterAndNumber(value),
        PASSWORD_LETTER_AND_NUMBER_ERROR_MESSAGE,
      ),
    passwordConfirm: z.string().min(1, '비밀번호를 한 번 더 입력해 주세요.'),
    agree: z.boolean().refine((value) => value, {
      message: '이용약관에 동의해 주세요.',
    }),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export const useSignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next');
  const loginHref = nextRaw
    ? `/login?next=${encodeURIComponent(nextRaw)}`
    : '/login';

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isEmailBlurred, setIsEmailBlurred] = useState(false);
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);
  const [isNicknameBlurred, setIsNicknameBlurred] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordBlurred, setIsPasswordBlurred] = useState(false);
  const [isPasswordConfirmFocused, setIsPasswordConfirmFocused] =
    useState(false);
  const [isPasswordConfirmBlurred, setIsPasswordConfirmBlurred] =
    useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    handleSubmit: submitWithValidation,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      nickname: '',
      password: '',
      passwordConfirm: '',
      agree: false,
    },
  });

  const email = watch('email') ?? '';
  const nickname = watch('nickname') ?? '';
  const password = watch('password') ?? '';
  const passwordConfirm = watch('passwordConfirm') ?? '';
  const agree = watch('agree') ?? false;

  const normalizedErrors: SignupErrors = {
    email:
      !isEmailFocused && isEmailBlurred ? (errors.email?.message ?? '') : '',
    nickname:
      !isNicknameFocused && isNicknameBlurred
        ? (errors.nickname?.message ?? '')
        : '',
    password: (() => {
      const passwordError = errors.password?.message ?? '';

      if (passwordError === PASSWORD_TRIPLE_REPEAT_ERROR_MESSAGE) {
        return passwordError;
      }

      return !isPasswordFocused && isPasswordBlurred ? passwordError : '';
    })(),
    passwordConfirm:
      !isPasswordConfirmFocused && isPasswordConfirmBlurred
        ? (errors.passwordConfirm?.message ?? '')
        : '',
    agree: errors.agree?.message ?? '',
  };

  const clearTransientErrorState = () => {
    if (isAlertOpen) setIsAlertOpen(false);
  };

  const isButtonDisabled =
    !email.trim() ||
    !nickname.trim() ||
    !password.trim() ||
    !passwordConfirm.trim() ||
    !agree ||
    !isValid ||
    isSubmitting;

  const handleSubmit = submitWithValidation(async (formValues) => {
    clearTransientErrorState();
    try {
      const res = await fetch('/api/proxy/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formValues.email,
          nickname: formValues.nickname,
          password: formValues.password,
        }),
      });

      const rawText = await res.text();

      let data: { message?: string } | null = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setIsSuccess(false);
        setAlertMessage(data?.message || rawText || '회원가입에 실패했습니다.');
        setIsAlertOpen(true);
        return;
      }

      setAlertMessage('가입이 완료되었습니다.');
      setIsSuccess(true);
      setIsAlertOpen(true);
    } catch {
      setIsSuccess(false);
      setAlertMessage('서버 오류가 발생했습니다.');
      setIsAlertOpen(true);
    }
  });

  const handleAlertConfirm = () => {
    setIsAlertOpen(false);
    if (isSuccess) {
      router.push(loginHref);
    }
  };

  return {
    loginHref,
    email,
    nickname,
    password,
    passwordConfirm,
    agree,
    showPassword,
    showPasswordConfirm,
    errors: normalizedErrors,
    isButtonDisabled,
    isSubmitting,
    isAlertOpen,
    alertMessage,
    setEmail: (value: string) => {
      clearTransientErrorState();
      if (isEmailBlurred) {
        setIsEmailBlurred(false);
      }
      setValue('email', value, { shouldDirty: true, shouldValidate: true });
    },
    setNickname: (value: string) => {
      clearTransientErrorState();
      if (isNicknameBlurred) {
        setIsNicknameBlurred(false);
      }
      setValue('nickname', value, { shouldDirty: true, shouldValidate: true });
    },
    setPassword: (value: string) => {
      clearTransientErrorState();
      if (isPasswordBlurred) {
        setIsPasswordBlurred(false);
      }
      setValue('password', value, { shouldDirty: true, shouldValidate: true });
    },
    setPasswordConfirm: (value: string) => {
      clearTransientErrorState();
      if (isPasswordConfirmBlurred) {
        setIsPasswordConfirmBlurred(false);
      }
      setValue('passwordConfirm', value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    setAgree: (value: boolean) => {
      clearTransientErrorState();
      setValue('agree', value, { shouldDirty: true, shouldValidate: true });
    },
    setShowPassword,
    setShowPasswordConfirm,
    setEmailFocus: (isFocused: boolean) => {
      setIsEmailFocused(isFocused);
      if (isFocused) {
        setIsEmailBlurred(false);
      } else {
        setIsEmailBlurred(true);
      }
    },
    setNicknameFocus: (isFocused: boolean) => {
      setIsNicknameFocused(isFocused);
      if (isFocused) {
        setIsNicknameBlurred(false);
      } else {
        setIsNicknameBlurred(true);
      }
    },
    setPasswordFocus: (isFocused: boolean) => {
      setIsPasswordFocused(isFocused);
      if (isFocused) {
        setIsPasswordBlurred(false);
      } else {
        setIsPasswordBlurred(true);
      }
    },
    setPasswordConfirmFocus: (isFocused: boolean) => {
      setIsPasswordConfirmFocused(isFocused);
      if (isFocused) {
        setIsPasswordConfirmBlurred(false);
      } else {
        setIsPasswordConfirmBlurred(true);
      }
    },
    handleSubmit,
    handleAlertConfirm,
  };
};
