import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getDashboard, getColumns, getCards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { ColumnsResponse } from '@/shared/types/dashboard';

const PREFETCH_COLUMN_CARDS_LIMIT = 2;
const PREFETCH_COLUMN_CARDS_SIZE = 10;
const SLOW_NETWORK_TYPES = new Set(['slow-2g', '2g']);

const shouldPrefetchColumnCards = () => {
  if (typeof navigator === 'undefined') return true;

  const connection = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
    }
  ).connection;

  if (!connection) return true;
  if (connection.saveData) return false;

  const effectiveType = connection.effectiveType ?? '';
  return !SLOW_NETWORK_TYPES.has(effectiveType);
};

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
      const canPrefetchColumnCards = shouldPrefetchColumnCards();

      inFlightPrefetchIdsRef.current.add(dashboardId);

      try {
        if (!hasDashboardCache || !hasColumnsCache) {
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
        }

        if (canPrefetchColumnCards) {
          const columnsData =
            queryClient.getQueryData<ColumnsResponse>(columnsKey);
          const prefetchColumnIds =
            columnsData?.data
              ?.slice(0, PREFETCH_COLUMN_CARDS_LIMIT)
              .map((column) => column.id) ?? [];

          if (prefetchColumnIds.length > 0) {
            await Promise.all(
              prefetchColumnIds.map((columnId) =>
                queryClient.prefetchQuery({
                  queryKey: [
                    ...QUERY_KEYS.columnCards(dashboardId),
                    PREFETCH_COLUMN_CARDS_SIZE,
                    columnId,
                  ],
                  queryFn: () => getCards(columnId, PREFETCH_COLUMN_CARDS_SIZE),
                  staleTime: 1000 * 60 * 2,
                }),
              ),
            );
          }
        }

        prefetchedDashboardIdsRef.current.add(dashboardId);
      } finally {
        inFlightPrefetchIdsRef.current.delete(dashboardId);
      }
    },
    [queryClient],
  );
};
