/**
 * @file MemberAvatars.tsx
 * @description 헤더에 표시되는 대시보드 멤버 아바타 목록 컴포넌트
 *
 * ### 렌더링 분기
 * - 로딩 중 (`isLoading && hasDashboard`): 스켈레톤 아바타 3개 표시
 * - 멤버 없음: `null` 반환
 * - 정상: 최대 `maxVisibleMembers`개까지 아바타 표시, 초과 시 `+N` 뱃지 표시
 *
 * @notes
 * - `maxVisibleMembers`는 부모(Header)에서 뷰포트 너비에 따라 동적으로 조정됨
 *   (데스크탑: 4개, 태블릿 이하: 2개)
 */

import type { Member } from '@/shared/types/dashboard';
import MemberAvatarOverflowBadge from '@/shared/components/layout/Header/MemberAvatarOverflowBadge';
import MemberAvatarSkeletonList from '@/shared/components/layout/Header/MemberAvatarSkeletonList';
import MemberAvatarVisibleList from '@/shared/components/layout/Header/MemberAvatarVisibleList';
import { getMemberAvatarDisplay } from '@/shared/components/layout/Header/memberAvatarDisplay';

interface MemberAvatarsProps {
  /** 표시할 전체 멤버 목록 */
  members: Member[];
  /** 아바타를 표시할 최대 멤버 수 (초과분은 +N 뱃지로 표시) */
  maxVisibleMembers: number;
  /** 멤버 목록 로딩 중 여부 */
  isLoading: boolean;
  /** 현재 페이지에 대시보드 ID가 있는지 여부 (스켈레톤 표시 조건) */
  hasDashboard: boolean;
}

export default function MemberAvatars({
  members,
  maxVisibleMembers,
  isLoading,
  hasDashboard,
}: MemberAvatarsProps) {
  const { visibleMembers, extraCount, hiddenNicknames } =
    getMemberAvatarDisplay(members, maxVisibleMembers);

  if (isLoading && hasDashboard) {
    return <MemberAvatarSkeletonList />;
  }

  if (visibleMembers.length === 0) return null;

  return (
    <div className="flex items-center shrink-0">
      <MemberAvatarVisibleList members={visibleMembers} />
      <MemberAvatarOverflowBadge
        extraCount={extraCount}
        visibleCount={visibleMembers.length}
        hiddenNicknames={hiddenNicknames}
      />
    </div>
  );
}
