/**
 * @file 대시보드 상세 페이지 - 칸반보드 ( /dashboard/{dashboardId} )
 * @description 서버 컴포넌트. 초기 데이터를 fetch로 병렬 패치한 뒤
 * DashboardBoard 클라이언트 컴포넌트에 props로 전달합니다.
 *
 * @author 하늘
 *
 * @notes
 * - 상호작용 로직(모달, 무한스크롤 등)은 DashboardBoard.tsx에서 처리합니다.
 */

import { Suspense } from 'react';
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import DashboardBoard from '@/shared/components/dashboard/DashboardBoard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  fetchDashboard,
  fetchColumns,
  fetchCards,
} from '@/shared/apis/dashboard.fetch';
import type { ColumnsResponse } from '@/shared/types/dashboard';

const INITIAL_COLUMN_CARDS_PREFETCH_LIMIT = 3;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;
  const dashboardId = Number(id);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 30,
      },
    },
  });

  if (Number.isFinite(dashboardId) && dashboardId > 0) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.dashboard(dashboardId),
        queryFn: () => fetchDashboard(dashboardId),
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.columns(dashboardId),
        queryFn: () => fetchColumns(dashboardId),
      }),
    ]);

    const columnsData = queryClient.getQueryData<{ data: { id: number }[] }>(
      QUERY_KEYS.columns(dashboardId),
    ) as ColumnsResponse | undefined;
    const columnIds = columnsData?.data?.map((column) => column.id) ?? [];

    if (columnIds.length > 0) {
      // 초기 응답 지연을 줄이기 위해 상단 일부 컬럼 카드만 서버에서 미리 채운다.
      const prefetchColumnIds = columnIds.slice(
        0,
        INITIAL_COLUMN_CARDS_PREFETCH_LIMIT,
      );

      await Promise.all(
        prefetchColumnIds.map((columnId) =>
          queryClient.prefetchQuery({
            queryKey: [...QUERY_KEYS.columnCards(dashboardId), 10, columnId],
            queryFn: () => fetchCards(columnId, 10),
            staleTime: 1000 * 30,
            gcTime: 1000 * 60 * 10,
          }),
        ),
      );
    }
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <Suspense
      fallback={<div className="min-h-screen-without-header bg-gray-100" />}
    >
      <HydrationBoundary state={dehydratedState}>
        <DashboardBoard dashboardId={dashboardId} />
      </HydrationBoundary>
    </Suspense>
  );
}
