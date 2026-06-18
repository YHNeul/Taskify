import Image from 'next/image';
import { ChangeEvent, RefObject } from 'react';

interface ProfileImageUploaderProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  currentPreviewImageUrl: string | null;
  onImageButtonClick: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileImageUploader({
  fileInputRef,
  currentPreviewImageUrl,
  onImageButtonClick,
  onImageChange,
}: ProfileImageUploaderProps) {
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 ms:h-44 ms:w-44">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />

      <button
        type="button"
        onClick={onImageButtonClick}
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
          <div className="flex h-full w-full items-center justify-center typo-2xl-semibold text-brand-violet">
            +
          </div>
        )}
      </button>
    </div>
  );
}
