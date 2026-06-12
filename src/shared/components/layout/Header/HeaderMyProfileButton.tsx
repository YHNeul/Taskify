import Image from 'next/image';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import type { Me } from '@/shared/apis/auth';

interface HeaderMyProfileButtonProps {
  me?: Me;
  isMeLoading: boolean;
  myChipColor: string;
  shouldPrioritizeMyAvatar: boolean;
  onProfileClick: () => void;
}

export default function HeaderMyProfileButton({
  me,
  isMeLoading,
  myChipColor,
  shouldPrioritizeMyAvatar,
  onProfileClick,
}: HeaderMyProfileButtonProps) {
  const nickname = me?.nickname ?? '사용자';
  const profileImageUrl = me?.profileImageUrl ?? null;
  const fallbackInitial = nickname[0]?.toUpperCase() ?? 'U';

  if (isMeLoading) {
    return (
      <div className="ml-2 md:ml-4 lg:ml-6 flex items-center gap-2 md:gap-3 border-l border-gray-300 pl-2 md:pl-4 lg:pl-6 shrink-0">
        <Skeleton className="w-profile-desktop h-profile-desktop rounded-full shrink-0" />
        <Skeleton className="h-4 w-20 rounded hidden lg:block" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onProfileClick}
      aria-label={`${nickname} 프로필 페이지로 이동`}
      className="ml-2 md:ml-4 lg:ml-6 flex items-center gap-2 md:gap-3 border-l border-gray-300 pl-2 md:pl-4 lg:pl-6 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
    >
      <div
        className="flex h-profile-desktop w-profile-desktop items-center justify-center rounded-full overflow-hidden text-lg-medium text-white shrink-0"
        style={{ backgroundColor: myChipColor }}
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={nickname}
            width={38}
            height={38}
            priority={shouldPrioritizeMyAvatar}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          fallbackInitial
        )}
      </div>
      <span className="hidden lg:inline text-lg-medium text-gray-700">
        {nickname}
      </span>
    </button>
  );
}
