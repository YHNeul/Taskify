import UserProfileImage from '@/shared/components/common/User/UserProfileImage';
import type { Member } from '@/shared/types/dashboard';

interface MemberAvatarVisibleListProps {
  members: Member[];
}

export default function MemberAvatarVisibleList({
  members,
}: MemberAvatarVisibleListProps) {
  return (
    <>
      {members.map((member, index) => (
        <div
          key={member.id}
          className="group relative shrink-0"
          style={{ zIndex: index + 1 }}
        >
          <UserProfileImage profile={member} index={index} size={38} />
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gray-600 px-2 py-1 text-xs-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {member.nickname}
          </span>
        </div>
      ))}
    </>
  );
}
