/**
 * @file SortableDashboardItem.tsx
 * @description 사이드바에서 드래그앤드롭으로 순서를 변경할 수 있는 대시보드 목록 아이템
 *
 * ### 레이아웃 분기
 * - `mobile` / `null(mobile 구간)` : 컬러 칩(원형)만 표시
 * - `tablet` / `null(tablet 구간)` : 컬러 칩 + 이름 + 왕관 아이콘
 * - `desktop` / `null(desktop 구간)` : 컬러 칩 + 이름(크게) + 왕관 아이콘
 * - `null` : SSR 초기 상태 — CSS 클래스 기반 반응형으로 세 레이아웃을 동시 렌더링
 *
 * @notes
 * - `hasDragged` 플래그로 드래그 직후 발생하는 click 이벤트를 무시합니다.
 * - `useDndMonitor`로 DnD 이벤트를 구독해 `hasDragged` 플래그를 관리합니다.
 * - `touchAction: 'pan-y'`로 모바일 수직 스크롤이 드래그와 충돌하지 않도록 합니다.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { useDndMonitor } from '@dnd-kit/core';
import CrownIcon from '@/shared/components/common/Icon/CrownIcon';
import { cn } from '@/lib/utils';
import { QUERY_PARAM_KEYS } from '@/shared/constants/queryParams.constants';
import type { Dashboard } from '@/shared/types/dashboard';
import { SIDEBAR_LAYOUT, type LayoutType } from '@/shared/utils/sidebarLayout';
import { useDashboardPrefetch } from '@/shared/hooks/useDashboardPrefetch';

interface SortableDashboardItemProps {
  /** 표시할 대시보드 데이터 */
  dashboard: Dashboard;
  /** 현재 활성(방문 중) 대시보드 여부 */
  isActive: boolean;
  /** 현재 사이드바 레이아웃 타입. `null`이면 CSS 클래스 기반 반응형 */
  layout: LayoutType | null;
}

export default function SortableDashboardItem({
  dashboard,
  isActive,
  layout,
}: SortableDashboardItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const hasDraggedRef = useRef(false);
  const resetDragTimeoutRef = useRef<number | null>(null);
  const prefetchDashboard = useDashboardPrefetch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dashboard.id });

  useDndMonitor({
    onDragStart(event) {
      if (String(event.active.id) !== String(dashboard.id)) return;
      hasDraggedRef.current = false;
    },
    onDragEnd(event) {
      if (String(event.active.id) !== String(dashboard.id)) return;

      hasDraggedRef.current = true;
      if (resetDragTimeoutRef.current !== null) {
        window.clearTimeout(resetDragTimeoutRef.current);
      }
      resetDragTimeoutRef.current = window.setTimeout(() => {
        hasDraggedRef.current = false;
        resetDragTimeoutRef.current = null;
      }, 100);
    },
  });

  const handleClick = () => {
    if (hasDraggedRef.current) return;

    const params = new URLSearchParams(searchParamsString);
    const sidePage = params.get(QUERY_PARAM_KEYS.SIDE_PAGE);
    const query = sidePage
      ? `${QUERY_PARAM_KEYS.SIDE_PAGE}=${encodeURIComponent(sidePage)}`
      : '';
    const targetUrl = query
      ? `/dashboard/${dashboard.id}?${query}`
      : `/dashboard/${dashboard.id}`;

    router.push(targetUrl);
  };

  const handlePrefetch = () => {
    router.prefetch(`/dashboard/${dashboard.id}`);
    prefetchDashboard(dashboard.id);
  };

  useEffect(
    () => () => {
      if (resetDragTimeoutRef.current !== null) {
        window.clearTimeout(resetDragTimeoutRef.current);
      }
    },
    [],
  );

  const handleTooltipEnter = (target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
    setTooltipOpen(true);
  };

  const handleTooltipLeave = () => {
    setTooltipOpen(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
    touchAction: 'pan-y',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
      aria-label={dashboard.title}
      {...attributes}
      {...listeners}
    >
      {layout === SIDEBAR_LAYOUT.MOBILE && (
        <div
          className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 ml-3.5 rounded transition-colors cursor-pointer',
            isActive ? 'bg-white' : 'hover:bg-gray-100',
            isDragging && 'bg-gray-100',
          )}
          aria-label={dashboard.title}
          onMouseEnter={(e) => handleTooltipEnter(e.currentTarget)}
          onMouseLeave={handleTooltipLeave}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dashboard.color }}
          />
        </div>
      )}

      {layout === null && (
        <>
          <div
            className={cn(
              'relative md:hidden flex items-center justify-center',
              'w-10 h-10 ml-3.5 rounded transition-colors cursor-pointer',
              isActive ? 'bg-white' : 'hover:bg-gray-100',
              isDragging && 'bg-gray-100',
            )}
            aria-label={dashboard.title}
            onMouseEnter={(e) => handleTooltipEnter(e.currentTarget)}
            onMouseLeave={handleTooltipLeave}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dashboard.color }}
            />
          </div>
          <div
            className={cn(
              'hidden md:flex lg:hidden items-center gap-4',
              'h-11 mx-2 px-2.5 rounded transition-colors cursor-pointer',
              isActive ? 'bg-brand-violet-light' : 'hover:bg-gray-100',
              isDragging && 'bg-gray-100',
            )}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dashboard.color }}
            />
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              <span
                className={cn(
                  'truncate text-lg-medium',
                  isActive ? 'text-gray-700' : 'text-gray-500',
                )}
              >
                {dashboard.title}
              </span>
              {dashboard.createdByMe && (
                <CrownIcon width={15} height={12} className="shrink-0" />
              )}
            </span>
          </div>
          <div
            className={cn(
              'hidden lg:flex items-center gap-4',
              'h-12 mx-3 px-3 rounded transition-colors cursor-pointer',
              isActive ? 'bg-brand-violet-light' : 'hover:bg-gray-100',
              isDragging && 'bg-gray-100',
            )}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dashboard.color }}
            />
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              <span
                className={cn(
                  'truncate text-2lg-medium',
                  isActive ? 'text-gray-700' : 'text-gray-500',
                )}
              >
                {dashboard.title}
              </span>
              {dashboard.createdByMe && (
                <CrownIcon width={18} height={14} className="shrink-0" />
              )}
            </span>
          </div>
        </>
      )}

      {layout === SIDEBAR_LAYOUT.TABLET && (
        <div
          className={cn(
            'flex items-center gap-4',
            'h-11 mx-2 px-2.5 rounded transition-colors cursor-pointer',
            isActive ? 'bg-brand-violet-light' : 'hover:bg-gray-100',
            isDragging && 'bg-gray-100',
          )}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dashboard.color }}
          />
          <span className="flex items-center gap-1.5 flex-1 min-w-0">
            <span
              className={cn(
                'truncate text-lg-medium',
                isActive ? 'text-gray-700' : 'text-gray-500',
              )}
            >
              {dashboard.title}
            </span>
            {dashboard.createdByMe && (
              <CrownIcon width={15} height={12} className="shrink-0" />
            )}
          </span>
        </div>
      )}

      {layout === SIDEBAR_LAYOUT.DESKTOP && (
        <div
          className={cn(
            'flex items-center gap-4',
            'h-12 mx-3 px-3 rounded transition-colors cursor-pointer',
            isActive ? 'bg-brand-violet-light' : 'hover:bg-gray-100',
            isDragging && 'bg-gray-100',
          )}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dashboard.color }}
          />
          <span className="flex items-center gap-1.5 flex-1 min-w-0">
            <span
              className={cn(
                'truncate text-2lg-medium',
                isActive ? 'text-gray-700' : 'text-gray-500',
              )}
            >
              {dashboard.title}
            </span>
            {dashboard.createdByMe && (
              <CrownIcon width={18} height={14} className="shrink-0" />
            )}
          </span>
        </div>
      )}

      {tooltipOpen && tooltipPos && (
        <span
          className="pointer-events-none fixed z-9999 whitespace-nowrap rounded-md bg-gray-700 px-2 py-1 text-xs-medium text-white"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
          }}
        >
          {dashboard.title}
        </span>
      )}
    </li>
  );
}
