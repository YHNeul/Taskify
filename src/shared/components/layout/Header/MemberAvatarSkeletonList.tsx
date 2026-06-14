import Skeleton from '@/shared/components/common/Skeleton/Skeleton';

const SKELETON_COUNT = 3;

export default function MemberAvatarSkeletonList() {
  return (
    <div className="flex items-center">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-profile-desktop h-profile-desktop rounded-full border-2 border-white"
          style={{ marginLeft: i !== 0 ? '-8px' : undefined }}
        />
      ))}
    </div>
  );
}
