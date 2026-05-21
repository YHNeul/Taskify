'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import AddBoxIcon from '@/components/common/Icon/AddBoxIcon';
import Pagination from '@/components/common/Pagination/Pagination';
import Logo from '@/components/common/Logo';
import Skeleton from '@/components/common/Skeleton/Skeleton';
import { cn } from '@/lib/utils';
import { getDashboards } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { Dashboard } from '@/types/dashboard';
import DashboardCreateModal from '@/components/modal/DashboardCreateModal';
import SortableDashboardItem from './SortableDashboardItem';
import SideMenuSkeleton from './SideMenuSkeleton';
import { useSidebarResize } from '@/hooks/useSidebarResize';

const PAGE_SIZE = 15;

/** 페이지별 대시보드 순서를 로컬 ID 배열로 정렬 */
function applyOrder(items: Dashboard[], ids: number[]): Dashboard[] {
  return [...items].sort((a, b) => {
    const ai = ids.indexOf(a.id);
    const bi = ids.indexOf(b.id);
    if (ai === -1) return -1;
    if (bi === -1) return 1;
    return ai - bi;
  });
}

/** localStorage에서 페이지 순서를 읽어 정렬 */
function applyStoredOrder(items: Dashboard[], key: string): Dashboard[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return applyOrder(items, JSON.parse(saved));
  } catch {
    /* ignore */
  }
  return items;
}

const SideMenu = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localOrderMap, setLocalOrderMap] = useState<Record<string, number[]>>(
    {},
  );

  const { sidebarWidth, layout, handleResizeStart } = useSidebarResize();
  const isMobileLayout = layout === 'mobile';

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 10 },
    }),
  );

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.dashboards(), page],
    queryFn: () => getDashboards(page, PAGE_SIZE),
    enabled: !isMobileLayout,
    staleTime: 0,
  });

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.dashboards(), 'infinite'],
    queryFn: ({ pageParam }) => getDashboards(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage, pages) => {
      const total = Math.ceil(lastPage.totalCount / PAGE_SIZE);
      return pages.length < total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isMobileLayout,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobileLayout || !bottomRef.current) return;
    const el = bottomRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobileLayout, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const dashboards = data?.dashboards ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const storageKey = `dashboard-order-page-${page}`;

  const orderedDashboards = useMemo(() => {
    const unique = dashboards.filter(
      (b, i, self) => i === self.findIndex((x) => x.id === b.id),
    );
    const inMemory = localOrderMap[storageKey];
    if (inMemory?.length) return applyOrder(unique, inMemory);
    return applyStoredOrder(unique, storageKey);
  }, [dashboards, localOrderMap, storageKey]);

  const orderedInfiniteDashboards = useMemo(() => {
    if (!infiniteData) return [];
    const allItems = infiniteData.pages.flatMap((pageData, i) => {
      const key = `dashboard-order-page-${i + 1}`;
      const inMemory = localOrderMap[key];
      if (inMemory?.length) return applyOrder(pageData.dashboards, inMemory);
      return applyStoredOrder(pageData.dashboards, key);
    });
    return allItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }, [infiniteData, localOrderMap]);

  const saveOrder = (key: string, ids: number[]) => {
    setLocalOrderMap((prev) => ({ ...prev, [key]: ids }));
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      /* 시크릿 모드 등 */
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedDashboards.findIndex((d) => d.id === active.id);
    const newIndex = orderedDashboards.findIndex((d) => d.id === over.id);
    saveOrder(
      storageKey,
      arrayMove(orderedDashboards, oldIndex, newIndex).map((d) => d.id),
    );
  };

  const handleMobileDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedInfiniteDashboards.findIndex(
      (d) => d.id === active.id,
    );
    const newIndex = orderedInfiniteDashboards.findIndex(
      (d) => d.id === over.id,
    );
    const newOrder = arrayMove(orderedInfiniteDashboards, oldIndex, newIndex);
    infiniteData?.pages.forEach((pageData, i) => {
      const key = `dashboard-order-page-${i + 1}`;
      const pageIdSet = new Set(pageData.dashboards.map((d) => d.id));
      saveOrder(
        key,
        newOrder.filter((d) => pageIdSet.has(d.id)).map((d) => d.id),
      );
    });
  };

  const currentIsLoading = isMobileLayout ? isInfiniteLoading : isLoading;

  return (
    <aside
      style={sidebarWidth !== null ? { width: sidebarWidth } : undefined}
      className={cn(
        'flex flex-col shrink-0 bg-white border-r border-gray-200 min-h-screen relative select-none',
        sidebarWidth === null && 'w-[67px] md:w-[160px] lg:w-[300px]',
      )}
    >
      <Link
        href={pathname.startsWith('/dashboard/') ? '/mydashboard' : '/'}
        className={cn(
          'flex items-center shrink-0',
          layout === null
            ? 'pt-5 pl-[22px] md:pt-5 md:pl-[13px] lg:pl-2 mb-[39px] md:mb-[57px] lg:mb-14'
            : layout === 'mobile'
              ? 'pt-5 pl-[22px] mb-[39px]'
              : layout === 'tablet'
                ? 'pt-5 pl-[13px] mb-[57px]'
                : 'pt-5 pl-2 mb-14',
        )}
      >
        {layout === null ? (
          <>
            <span className="md:hidden">
              <Logo variant="small" />
            </span>
            <span className="hidden md:block">
              <Logo variant="large" />
            </span>
          </>
        ) : layout === 'mobile' ? (
          <Logo variant="small" />
        ) : (
          <Logo variant="large" />
        )}
      </Link>

      <div
        className={cn(
          'flex items-center justify-between shrink-0',
          layout === null
            ? 'pl-6 pr-[14px] md:pl-[13px] md:pr-[13px] lg:pl-2 lg:pr-3 mb-[18px] md:mb-4'
            : layout === 'mobile'
              ? 'pl-6 pr-[14px] mb-[18px]'
              : layout === 'tablet'
                ? 'pl-[13px] pr-[13px] mb-4'
                : 'pl-2 pr-3 mb-4',
        )}
      >
        <span
          className={cn(
            'text-xs-semibold text-gray-500',
            layout === null
              ? 'hidden md:block'
              : layout === 'mobile'
                ? 'hidden'
                : 'block',
          )}
        >
          Dash Boards
        </span>
        <button
          type="button"
          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="대시보드 추가"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <AddBoxIcon width={20} height={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentIsLoading ? (
          <SideMenuSkeleton layout={layout} />
        ) : isMobileLayout ? (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleMobileDragEnd}
            >
              <SortableContext
                items={orderedInfiniteDashboards.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col gap-1.5">
                  {orderedInfiniteDashboards.map((dashboard) => (
                    <SortableDashboardItem
                      key={dashboard.id}
                      dashboard={dashboard}
                      isActive={
                        pathname === `/dashboard/${dashboard.id}` ||
                        pathname.startsWith(`/dashboard/${dashboard.id}/`)
                      }
                      layout="mobile"
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Skeleton className="w-2 h-2 rounded-full" />
              </div>
            )}
            <div ref={bottomRef} className="h-1" />
          </>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedDashboards.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul
                className={cn(
                  'flex flex-col',
                  layout === null
                    ? 'gap-1.5 md:gap-0.5 lg:gap-2'
                    : layout === 'tablet'
                      ? 'gap-0.5'
                      : 'gap-2',
                )}
              >
                {orderedDashboards.map((dashboard) => (
                  <SortableDashboardItem
                    key={dashboard.id}
                    dashboard={dashboard}
                    isActive={
                      pathname === `/dashboard/${dashboard.id}` ||
                      pathname.startsWith(`/dashboard/${dashboard.id}/`)
                    }
                    layout={layout}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {!isMobileLayout && totalPages > 1 && (
        <div
          className={cn(
            'flex items-center gap-3 shrink-0 px-5 pb-4',
            layout === null
              ? 'hidden md:flex pt-6 lg:pt-8'
              : layout === 'tablet'
                ? 'pt-6'
                : 'pt-8',
          )}
        >
          <Pagination
            size="sm"
            currentPage={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
          <span className="text-xs-regular text-gray-500">
            {page} / {totalPages}
          </span>
        </div>
      )}

      <div
        className="absolute -right-2 top-0 h-full w-5 touch-none z-20 cursor-col-resize"
        onPointerDown={handleResizeStart}
      >
        <div className="absolute right-2 top-0 h-full w-1 hover:bg-brand-violet/30 active:bg-brand-violet/50 transition-colors" />
      </div>

      <DashboardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newId) => {
          const key = 'dashboard-order-page-1';
          const existing: number[] = (() => {
            try {
              return JSON.parse(localStorage.getItem(key) ?? '[]');
            } catch {
              return [];
            }
          })();
          saveOrder(key, [newId, ...existing.filter((id) => id !== newId)]);
          setPage(1);
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.dashboards(),
            exact: false,
          });
        }}
        dashboards={dashboards}
      />
    </aside>
  );
};

export default SideMenu;
