import { getCards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { Column } from '@/shared/types/dashboard';
import { ColumnCardState } from '@/shared/hooks/useBoardDnd';
import { useQueries, type UseQueryOptions } from '@tanstack/react-query';

interface UseDashboardColumnCardsQueryParams {
  dashboardId: number;
  columns: Column[];
  size?: number;
}

type DashboardColumnCardsQueryData = Record<number, ColumnCardState>;
const getColumnCardsQueryKey = (
  dashboardId: number,
  size: number,
  columnId: number,
) => [...QUERY_KEYS.columnCards(dashboardId), size, columnId] as const;
type UseDashboardColumnCardsQueryOptions = Omit<
  UseQueryOptions<
    Awaited<ReturnType<typeof getCards>>,
    Error,
    Awaited<ReturnType<typeof getCards>>
  >,
  'queryKey' | 'queryFn'
>;

export const useDashboardColumnCardsQuery = (
  { dashboardId, columns, size = 10 }: UseDashboardColumnCardsQueryParams,
  queryOptions?: UseDashboardColumnCardsQueryOptions,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const hasColumns = columns.length > 0;
  const isQueryEnabled = queryOptions?.enabled !== false;
  const columnIdsKey = columns.map((column) => column.id).join('|');

  return useQueries({
    queries: columns.map((column) => ({
      ...queryOptions,
      queryKey: getColumnCardsQueryKey(dashboardId, size, column.id),
      queryFn: () => getCards(column.id, size),
      enabled: isDashboardIdValid && hasColumns && isQueryEnabled,
      staleTime: queryOptions?.staleTime ?? 1000 * 60 * 2,
      gcTime: queryOptions?.gcTime ?? 1000 * 60 * 10,
      refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? false,
      refetchOnReconnect: queryOptions?.refetchOnReconnect ?? false,
    })),
    combine: (results) => {
      const dataMap: DashboardColumnCardsQueryData = {};
      const dataUpdatedAtList: number[] = [];

      results.forEach((result, index) => {
        dataUpdatedAtList.push(result.dataUpdatedAt);
        const columnId = columns[index]?.id;
        if (!columnId || !result.data) return;

        dataMap[columnId] = {
          cards: result.data.cards,
          totalCount: result.data.totalCount,
          cursorId: result.data.cursorId,
        };
      });

      return {
        data: Object.keys(dataMap).length > 0 ? dataMap : undefined,
        dataVersion: `${columnIdsKey}:${dataUpdatedAtList.join('|')}`,
        isLoading: results.some((result) => result.isLoading),
        isFetching: results.some((result) => result.isFetching),
        isError: results.some((result) => result.isError),
      };
    },
  });
};
