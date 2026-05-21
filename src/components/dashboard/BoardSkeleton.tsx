/**
 * @file BoardSkeleton.tsx
 * @description 대시보드 칸반 보드의 로딩 스켈레톤 UI 컴포넌트
 * 컬럼 및 카드 데이터가 로드되기 전에 레이아웃 자리를 채워 CLS(레이아웃 이동)를 최소화
 *
 * ### 컴포넌트 구성
 * - `TaskCardSkeleton` — 카드 1개의 스켈레톤 (제목, 태그, 날짜/담당자)
 * - `ColumnSkeleton` — 컬럼 1개의 스켈레톤 (헤더 + 추가 버튼 + 카드 목록)
 * - `DashboardBoardSkeleton` (default export) — 전체 보드 스켈레톤 (3개의 ColumnSkeleton)
 */

import Skeleton from '@/components/common/Skeleton/Skeleton';

/** 칸반 카드 1개의 스켈레톤 */
function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
      <Skeleton className="h-5 w-3/4 rounded" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-1">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="w-[26px] h-[26px] rounded-full" />
      </div>
    </div>
  );
}

/**
 * 칸반 컬럼 1개의 스켈레톤
 *
 * @param cardCount - 표시할 카드 스켈레톤 개수 (기본값: 3)
 */
function ColumnSkeleton({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <div
      className={[
        'flex flex-col shrink-0',
        'w-full lg:w-[354px]',
        'border-b lg:border-b-0 lg:border-r border-gray-200',
        'pb-4 lg:pb-0',
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-4 md:px-5 h-[64px] shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full shrink-0" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-7 rounded-full" />
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>
      <div className="px-4 md:px-5 mb-4 shrink-0">
        <Skeleton className="h-10 w-full lg:w-[314px] rounded-[6px]" />
      </div>
      <div className="flex-1 px-4 md:px-5 flex flex-col gap-2 pb-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** 대시보드 칸반 보드 전체의 스켈레톤 UI */
export default function DashboardBoardSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden bg-gray-100">
        <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto">
          <ColumnSkeleton cardCount={3} />
          <ColumnSkeleton cardCount={2} />
          <ColumnSkeleton cardCount={4} />
        </div>
      </div>
    </div>
  );
}
