import type { Member } from '@/shared/types/dashboard';

interface MemberAvatarDisplay {
  visibleMembers: Member[];
  hiddenMembers: Member[];
  extraCount: number;
  hiddenNicknames: string;
}

export const getMemberAvatarDisplay = (
  members: Member[],
  maxVisibleMembers: number,
): MemberAvatarDisplay => {
  const safeMembers = Array.isArray(members) ? members : [];
  const visibleCount =
    Number.isFinite(maxVisibleMembers) && maxVisibleMembers > 0
      ? Math.floor(maxVisibleMembers)
      : 0;

  const visibleMembers = safeMembers.slice(0, visibleCount);
  const hiddenMembers = safeMembers.slice(visibleCount);

  return {
    visibleMembers,
    hiddenMembers,
    extraCount: hiddenMembers.length,
    hiddenNicknames: hiddenMembers.map((member) => member.nickname).join(', '),
  };
};
