'use client';

import { useRouter } from 'next/navigation';

import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import AlertModal from '@/shared/components/modal/AlertModal';
import Button from '@/shared/components/common/Button';
import PasswordChangeForm from '@/shared/components/mypage/PasswordChangeForm';
import ProfileEditForm from '@/shared/components/mypage/ProfileEditForm';
import { useLogout } from '@/shared/hooks/useLogout';
import { useMyPageForm } from '@/shared/hooks/useMyPageForm';

export default function MyPageContent() {
  const router = useRouter();
  const handleLogout = useLogout('/');
  const {
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
    submitProfileForm,
    handleProfileImageButtonClick,
    handleProfileImageChange,
    isPasswordFormValid,
    isPasswordSubmitting,
    registerPassword,
    currentPasswordRegister,
    onCurrentPasswordChange,
    onCurrentPasswordBlur,
    currentPasswordErrorMessage,
    newPasswordErrorMessage,
    confirmPasswordErrorMessage,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    toggleShowCurrentPassword,
    toggleShowNewPassword,
    toggleShowConfirmPassword,
    submitPasswordForm,
  } = useMyPageForm();

  if (isLoading) {
    return <div className="p-6">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 md:gap-2"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4.5 rotate-180 md:w-5"
        >
          <path
            d="M12.359 9.99933L6.08176 3.72208C5.91616 3.55648 5.8355 3.35937 5.8355 3.13043C5.8355 2.90149 5.91616 2.70437 6.08176 2.53878C6.24735 2.37318 6.44447 2.29252 6.67341 2.29252C6.90235 2.29252 7.09947 2.37318 7.26506 2.53878L13.9411 9.21483C14.0578 9.33153 14.1455 9.46047 14.2044 9.60164C14.2632 9.74281 14.2926 9.88838 14.2926 10.0383C14.2926 10.1882 14.2632 10.3338 14.2044 10.4749C14.1455 10.6161 14.0578 10.7451 13.9411 10.8618L7.26506 17.5378C7.09947 17.7034 6.90235 17.7841 6.67341 17.7841C6.44447 17.7841 6.24735 17.7034 6.08176 17.5378C5.91616 17.3722 5.8355 17.1751 5.8355 16.9462C5.8355 16.7172 5.91616 16.5201 6.08176 16.3545L12.359 10.0773C12.4757 9.96059 12.5346 9.82664 12.5346 9.67545C12.5346 9.52426 12.4757 9.39031 12.359 9.27361V9.99933Z"
            fill="#333236"
          />
        </svg>

        <span className="text-sm-medium md:text-md-medium mt-px text-gray-700">
          돌아가기
        </span>
      </button>

      <div className="flex w-full max-w-2xl flex-col mt-4 gap-4 md:gap-6">
        <ProfileEditForm
          initialEmail={initialEmail}
          fileInputRef={fileInputRef}
          currentPreviewImageUrl={currentPreviewImageUrl}
          onImageButtonClick={handleProfileImageButtonClick}
          onImageChange={handleProfileImageChange}
          registerNickname={registerProfile}
          nicknameError={profileErrors.nickname?.message}
          isProfileChanged={isProfileChanged}
          isProfileSubmitting={isProfileSubmitting}
          onSubmit={submitProfileForm}
        />

        <PasswordChangeForm
          currentPasswordRegister={currentPasswordRegister}
          registerPassword={registerPassword}
          onCurrentPasswordChange={onCurrentPasswordChange}
          onCurrentPasswordBlur={onCurrentPasswordBlur}
          currentPasswordErrorMessage={currentPasswordErrorMessage}
          newPasswordErrorMessage={newPasswordErrorMessage}
          confirmPasswordErrorMessage={confirmPasswordErrorMessage}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          toggleShowCurrentPassword={toggleShowCurrentPassword}
          toggleShowNewPassword={toggleShowNewPassword}
          toggleShowConfirmPassword={toggleShowConfirmPassword}
          isPasswordFormValid={isPasswordFormValid}
          isPasswordSubmitting={isPasswordSubmitting}
          onSubmit={submitPasswordForm}
        />

        <Button
          variant="secondary"
          size="lg"
          className="mt-6 h-12 w-full"
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
