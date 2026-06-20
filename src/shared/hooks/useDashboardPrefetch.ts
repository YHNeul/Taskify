import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getDashboard, getColumns } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useDashboardPrefetch = () => {
  const queryClient = useQueryClient();
  const prefetchedDashboardIdsRef = useRef<Set<number>>(new Set());
  const inFlightPrefetchIdsRef = useRef<Set<number>>(new Set());

  return useCallback(
    async (dashboardId: number) => {
      if (!Number.isFinite(dashboardId) || dashboardId <= 0) return;
      if (prefetchedDashboardIdsRef.current.has(dashboardId)) return;
      if (inFlightPrefetchIdsRef.current.has(dashboardId)) return;

      const dashboardKey = QUERY_KEYS.dashboard(dashboardId);
      const columnsKey = QUERY_KEYS.columns(dashboardId);
      const hasDashboardCache = Boolean(queryClient.getQueryData(dashboardKey));
      const hasColumnsCache = Boolean(queryClient.getQueryData(columnsKey));

      if (hasDashboardCache && hasColumnsCache) {
        prefetchedDashboardIdsRef.current.add(dashboardId);
        return;
      }

      inFlightPrefetchIdsRef.current.add(dashboardId);

      try {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: dashboardKey,
            queryFn: () => getDashboard(dashboardId),
            staleTime: 1000 * 60 * 3,
          }),
          queryClient.prefetchQuery({
            queryKey: columnsKey,
            queryFn: () => getColumns(dashboardId),
            staleTime: 1000 * 60 * 3,
          }),
        ]);
        prefetchedDashboardIdsRef.current.add(dashboardId);
      } finally {
        inFlightPrefetchIdsRef.current.delete(dashboardId);
      }
    },
    [queryClient],
  );
};
