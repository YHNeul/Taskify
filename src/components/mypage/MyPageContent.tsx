/**
 * @file 계정 관리 페이지 ( /mypage )
 * @description 유저의 프로필 이미지, 닉네임, 비밀번호를 수정하는 마이페이지입니다.
 * @note 프로필 이미지 업로드 API 연동과, 현재 비밀번호 검증 로직이 포함됩니다.
 */

'use client';

import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import ModalOverlay from '../common/ModalBase/ModalOverlay';
import AlertModal from '@/components/modal/AlertModal';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button';
import {
  getMyInfo,
  updateMyInfo,
  uploadProfileImage,
  changePassword,
} from '@/api/user';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { clearToken, getToken } from '@/lib/auth';

export default function MyPageContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const { data: myInfo, isLoading } = useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMyInfo,
  });

  const initialEmail = myInfo?.email ?? '';
  const initialNickname = myInfo?.nickname ?? '';
  const initialProfileImageUrl = myInfo?.profileImageUrl ?? null;

  const [nickname, setNickname] = useState<string | undefined>(undefined);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // NOTE: 서버에서 받아온 초기값과 사용자가 수정 중인 값을 분리해서 다루기 위한 값
  const currentNickname = nickname ?? initialNickname;
  const currentPreviewImageUrl = previewImageUrl ?? initialProfileImageUrl;

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // 비밀번호 state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 에러 상태
  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);

  const isNicknameChanged =
    nickname !== undefined && currentNickname !== initialNickname;
  const isImageChanged = selectedImageFile !== null;
  const isProfileChanged = isNicknameChanged || isImageChanged;

  const isPasswordFormValid =
    currentPassword !== '' && newPassword !== '' && confirmPassword !== '';

  // NOTE: 이미지 업로드와 프로필 수정은 요청 흐름이 달라 mutation을 분리했습니다.
  const uploadProfileImageMutation = useMutation({
    mutationFn: uploadProfileImage,
  });

  // NOTE: 수정 성공 후 최신 사용자 정보를 다시 조회하기 위해 캐시를 무효화합니다.
  const updateMyInfoMutation = useMutation({
    mutationFn: updateMyInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      openAlert('프로필이 업데이트되었습니다.');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      openAlert('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordMismatch(false);
    },
  });

  // NOTE: 이미지 미리보기용으로 생성한 object URL이 남지 않도록 정리합니다.
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const renderPasswordToggleButton = (
    isVisible: boolean,
    onToggle: () => void,
  ) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label="비밀번호 표시 전환"
      className="flex items-center justify-center h-full"
    >
      {isVisible ? <EyeOff size={24} /> : <Eye size={24} />}
    </button>
  );

  // NOTE: 로그인하지 않은 사용자는 메인페이지로 이동
  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace('/');
    }
  }, [router]);

  const openAlert = (message: string) => {
    setAlertMessage(message);
  };

  const closeAlert = () => {
    setAlertMessage(null);
  };

  const handleCurrentPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  // blur 시 검증
  const handleConfirmPasswordBlur = () => {
    if (newPassword !== confirmPassword) {
      setIsPasswordMismatch(true);
    } else {
      setIsPasswordMismatch(false);
    }
  };

  // 변경 버튼 클릭
  const handlePasswordChange = async () => {
    if (!isPasswordFormValid) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsPasswordMismatch(true);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        password: currentPassword,
        newPassword,
      });
    } catch {
      openAlert('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
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

    // NOTE: 같은 파일을 다시 선택해도 change 이벤트가 동작하도록 value를 초기화합니다.
    event.target.value = '';
  };

  const handleProfileSave = async () => {
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
        nickname: currentNickname,
        profileImageUrl,
      });

      setSelectedImageFile(null);
      setPreviewImageUrl(undefined);
    } catch {
      openAlert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  // NOTE: 로그아웃 처리 (토큰 삭제 후 메인페이지 이동)
  const handleLogout = () => {
    clearToken();
    router.replace('/');
  };

  if (isLoading) {
    return <div className="p-6">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-[6px] md:gap-[8px]"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[18px] rotate-180 md:w-[20px]"
        >
          <path
            d="M12.359 9.99933L6.08176 3.72208C5.91616 3.55648 5.8355 3.35937 5.8355 3.13043C5.8355 2.90149 5.91616 2.70437 6.08176 2.53878C6.24735 2.37318 6.44447 2.29252 6.67341 2.29252C6.90235 2.29252 7.09947 2.37318 7.26506 2.53878L13.9411 9.21483C14.0578 9.33153 14.1455 9.46047 14.2044 9.60164C14.2632 9.74281 14.2926 9.88838 14.2926 10.0383C14.2926 10.1882 14.2632 10.3338 14.2044 10.4749C14.1455 10.6161 14.0578 10.7451 13.9411 10.8618L7.26506 17.5378C7.09947 17.7034 6.90235 17.7841 6.67341 17.7841C6.44447 17.7841 6.24735 17.7034 6.08176 17.5378C5.91616 17.3722 5.8355 17.1751 5.8355 16.9462C5.8355 16.7172 5.91616 16.5201 6.08176 16.3545L12.359 10.0773C12.4757 9.96059 12.5346 9.82664 12.5346 9.67545C12.5346 9.52426 12.4757 9.39031 12.359 9.27361V9.99933Z"
            fill="#333236"
          />
        </svg>

        <span className="text-md-medium md:text-lg-medium mt-[1px] text-gray-700">
          돌아가기
        </span>
      </button>

      <div className="flex w-full max-w-[624px] flex-col mt-4 gap-4 md:gap-6">
        <section className="rounded-2xl bg-white px-4 py-5 md:p-6">
          <h2 className="mb-6 text-2xl-bold leading-none text-gray-900">
            프로필
          </h2>

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-[42px]">
            <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-md bg-[#f5f5f5] ms:h-[180px] ms:w-[180px]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />

              <button
                type="button"
                onClick={handleProfileImageButtonClick}
                className="h-full w-full"
                aria-label="프로필 이미지 업로드"
              >
                {currentPreviewImageUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={currentPreviewImageUrl}
                      alt="프로필 미리보기"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl-semibold text-brand-violet">
                    +
                  </div>
                )}
              </button>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-4">
              <Input
                label="이메일"
                value={initialEmail}
                readOnly
                className="bg-white"
              />

              <Input
                label="닉네임"
                value={currentNickname}
                onChange={handleNicknameChange}
                placeholder="닉네임 입력"
                maxLength={10}
              />

              <Button
                size="modal_lg"
                className="w-full"
                disabled={!isProfileChanged}
                onClick={handleProfileSave}
              >
                저장
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white px-4 py-5 md:p-6">
          <h2 className="mb-6 text-2xl-bold leading-none text-gray-700">
            비밀번호 변경
          </h2>

          <div className="flex flex-col gap-4">
            <Input
              label="현재 비밀번호"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="비밀번호 입력"
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              rightIcon={renderPasswordToggleButton(showCurrentPassword, () =>
                setShowCurrentPassword((prev) => !prev),
              )}
            />

            <Input
              label="새 비밀번호"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={handleNewPasswordChange}
              rightIcon={renderPasswordToggleButton(showNewPassword, () =>
                setShowNewPassword((prev) => !prev),
              )}
            />

            <div>
              <Input
                label="새 비밀번호 확인"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="새 비밀번호 입력"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur}
                isError={isPasswordMismatch}
                errorMessage={
                  isPasswordMismatch
                    ? '비밀번호가 일치하지 않습니다.'
                    : undefined
                }
                rightIcon={renderPasswordToggleButton(showConfirmPassword, () =>
                  setShowConfirmPassword((prev) => !prev),
                )}
              />
              {/* 에러메시지 공간 확보 */}
              <div className="mt-1 h-5" />
            </div>

            <Button
              size="modal_lg"
              className="w-full"
              disabled={!isPasswordFormValid}
              onClick={handlePasswordChange}
            >
              변경
            </Button>
          </div>
        </section>

        <Button
          variant="secondary"
          size="modal_lg"
          className="w-full mt-6"
          onClick={handleLogout}
        >
          로그아웃
        </Button>

        {alertMessage && (
          <ModalOverlay onClose={closeAlert}>
            <AlertModal message={alertMessage} onConfirm={closeAlert} />
          </ModalOverlay>
        )}
      </div>
    </div>
  );
}
