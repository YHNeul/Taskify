import { getCards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { Column } from '@/shared/types/dashboard';
import { ColumnCardState } from '@/shared/hooks/useBoardDnd';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

interface UseDashboardColumnCardsQueryParams {
  dashboardId: number;
  columns: Column[];
  size?: number;
}

type DashboardColumnCardsQueryData = Record<number, ColumnCardState>;
const getColumnCardsQueryKey = (
  dashboardId: number,
  size: number,
  columnIds: number[],
) => [...QUERY_KEYS.columnCards(dashboardId), size, columnIds] as const;
type DashboardColumnCardsQueryKey = ReturnType<typeof getColumnCardsQueryKey>;
type UseDashboardColumnCardsQueryOptions = Omit<
  UseQueryOptions<
    DashboardColumnCardsQueryData,
    Error,
    DashboardColumnCardsQueryData,
    DashboardColumnCardsQueryKey
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
  const columnIds = columns.map((column) => column.id);

  return useQuery<
    DashboardColumnCardsQueryData,
    Error,
    DashboardColumnCardsQueryData,
    DashboardColumnCardsQueryKey
  >({
    ...queryOptions,
    queryKey: getColumnCardsQueryKey(dashboardId, size, columnIds),
    queryFn: async () => {
      const results = await Promise.all(
        columns.map((column) => getCards(column.id, size)),
      );
      const map: Record<number, ColumnCardState> = {};
      columns.forEach((column, index) => {
        map[column.id] = {
          cards: results[index].cards,
          totalCount: results[index].totalCount,
          cursorId: results[index].cursorId,
        };
      });
      return map;
    },
    enabled: isDashboardIdValid && hasColumns && isQueryEnabled,
    staleTime: queryOptions?.staleTime ?? 1000 * 30,
    gcTime: queryOptions?.gcTime ?? 1000 * 60 * 10,
  });
};
