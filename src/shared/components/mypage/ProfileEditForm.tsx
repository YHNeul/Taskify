import type { ChangeEvent, RefObject } from 'react';
import type { UseFormRegister } from 'react-hook-form';

import Button from '@/shared/components/common/Button';
import Input from '@/shared/components/common/Input/Input';
import type { ProfileFormValues } from '@/shared/hooks/useMyPageForm';

import ProfileImageUploader from '@/shared/components/mypage/ProfileImageUploader';

interface ProfileEditFormProps {
  initialEmail: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  currentPreviewImageUrl: string | null;
  onImageButtonClick: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  registerNickname: UseFormRegister<ProfileFormValues>;
  nicknameError?: string;
  isProfileChanged: boolean;
  isProfileSubmitting: boolean;
  onSubmit: () => void;
}

export default function ProfileEditForm({
  initialEmail,
  fileInputRef,
  currentPreviewImageUrl,
  onImageButtonClick,
  onImageChange,
  registerNickname,
  nicknameError,
  isProfileChanged,
  isProfileSubmitting,
  onSubmit,
}: ProfileEditFormProps) {
  return (
    <form
      className="rounded-2xl bg-white px-4 py-5 md:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="mb-6 text-lg-bold leading-none text-gray-900">프로필</h2>

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-10">
        <ProfileImageUploader
          fileInputRef={fileInputRef}
          currentPreviewImageUrl={currentPreviewImageUrl}
          onImageButtonClick={onImageButtonClick}
          onImageChange={onImageChange}
        />

        <div className="flex w-full min-w-0 flex-col gap-4">
          <Input
            label="이메일"
            labelClassName="text-md-medium"
            value={initialEmail}
            readOnly
            className="bg-white text-md-regular md:text-lg-regular"
          />

          <Input
            label="닉네임"
            labelClassName="text-md-medium"
            placeholder="닉네임 입력"
            maxLength={10}
            {...registerNickname('nickname')}
            isError={!!nicknameError}
            errorMessage={nicknameError}
            className="text-md-regular md:text-lg-regular"
          />

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full"
            disabled={!isProfileChanged || isProfileSubmitting}
          >
            저장
          </Button>
        </div>
      </div>
    </form>
  );
}
