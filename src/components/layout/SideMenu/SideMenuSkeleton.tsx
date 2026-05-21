/**
 * @file SideMenuSkeleton.tsx
 * @description 사이드바 대시보드 목록의 로딩 스켈레톤 UI 컴포넌트
 * `layout` 값에 따라 mobile / tablet / desktop 형태로 분기하여 렌더링
 *
 * @notes
 * - `layout === null`인 SSR 초기 상태에서는 세 형태를 동시 렌더링하고
 *   CSS 클래스(`md:hidden`, `hidden lg:flex` 등)로 반응형을 처리
 */

import Skeleton from '@/components/common/Skeleton/Skeleton';
import { cn } from '@/lib/utils';
import type { LayoutType } from '@/utils/sidebarLayout';

interface SideMenuSkeletonProps {
  /** 현재 사이드바 레이아웃 타입. `null`이면 CSS 클래스 기반 반응형 */
  layout: LayoutType | null;
}

export default function SideMenuSkeleton({ layout }: SideMenuSkeletonProps) {
  return (
    <ul
      className={cn(
        'flex flex-col',
        layout === null
          ? 'gap-1.5 md:gap-0.5 lg:gap-2'
          : layout === 'mobile'
            ? 'gap-1.5'
            : layout === 'tablet'
              ? 'gap-0.5'
              : 'gap-2',
      )}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i}>
          {(layout === null || layout === 'mobile') && (
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 ml-[14px]',
                layout === null && 'md:hidden',
              )}
            >
              <Skeleton className="w-2 h-2 rounded-full" />
            </div>
          )}
          {(layout === null || layout === 'tablet') && (
            <div
              className={cn(
                'flex items-center gap-4 h-[43px] mx-2 px-[10px]',
                layout === null && 'hidden md:flex lg:hidden',
              )}
            >
              <Skeleton className="w-2 h-2 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1 rounded-[4px]" />
            </div>
          )}
          {(layout === null || layout === 'desktop') && (
            <div
              className={cn(
                'flex items-center gap-4 h-[50px] mx-3 px-3',
                layout === null && 'hidden lg:flex',
              )}
            >
              <Skeleton className="w-2 h-2 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1 rounded-[4px]" />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
