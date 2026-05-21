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

import UserProfileImage from '@/components/common/User/UserProfileImage';
import Skeleton from '@/components/common/Skeleton/Skeleton';
import type { Member } from '@/types/dashboard';

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
  const visibleMembers = members.slice(0, maxVisibleMembers);
  const extraCount = Math.max(0, members.length - maxVisibleMembers);

  if (isLoading && hasDashboard) {
    return (
      <div className="flex items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-[38px] h-[38px] rounded-full border-2 border-white"
            style={{ marginLeft: i !== 0 ? '-8px' : undefined }}
          />
        ))}
      </div>
    );
  }

  if (visibleMembers.length === 0) return null;

  return (
    <div className="flex items-center shrink-0">
      {visibleMembers.map((member, index) => (
        <div
          key={member.id}
          title={member.nickname}
          style={{
            marginLeft: index !== 0 ? '-8px' : undefined,
            zIndex: index + 1,
          }}
        >
          <UserProfileImage profile={member} index={index} size={38} />
        </div>
      ))}
      {extraCount > 0 && (
        <div
          className="-ml-2 flex h-[38px] min-w-[38px] items-center justify-center rounded-full border-2 border-white bg-[#F4D7DA] px-[8px] text-xs-semibold text-[#D25B68]"
          style={{ zIndex: visibleMembers.length + 1 }}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
}
