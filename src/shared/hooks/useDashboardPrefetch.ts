import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getDashboard, getColumns } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useDashboardPrefetch = () => {
  const queryClient = useQueryClient();

  return useCallback(
    async (dashboardId: number) => {
      if (!Number.isFinite(dashboardId) || dashboardId <= 0) return;

      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.dashboard(dashboardId),
          queryFn: () => getDashboard(dashboardId),
          staleTime: 1000 * 60 * 3,
        }),
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.columns(dashboardId),
          queryFn: () => getColumns(dashboardId),
          staleTime: 1000 * 60 * 3,
        }),
      ]);
    },
    [queryClient],
  );
};
