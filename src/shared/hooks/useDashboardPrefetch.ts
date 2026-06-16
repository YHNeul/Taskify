import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getDashboard, getColumns, getCards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export function useDashboardPrefetch() {
  const queryClient = useQueryClient();

  return useCallback(
    async (dashboardId: number) => {
      if (!Number.isFinite(dashboardId) || dashboardId <= 0) return;

      const [_, columnsResult] = await Promise.all([
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.dashboard(dashboardId),
          queryFn: () => getDashboard(dashboardId),
          staleTime: 1000 * 60 * 3,
        }),
        queryClient.fetchQuery({
          queryKey: QUERY_KEYS.columns(dashboardId),
          queryFn: () => getColumns(dashboardId),
          staleTime: 1000 * 60 * 3,
        }),
      ]);

      // 대시보드 진입 직후 LCP 영역에 노출될 가능성이 높은 앞쪽 컬럼 카드만 선로딩한다.
      const firstColumns = columnsResult.data.slice(0, 2);
      await Promise.all(
        firstColumns.map((column) =>
          queryClient.prefetchQuery({
            queryKey: [...QUERY_KEYS.columnCards(dashboardId), 10, column.id],
            queryFn: () => getCards(column.id, 10),
            staleTime: 1000 * 30,
          }),
        ),
      );
    },
    [queryClient],
  );
}
