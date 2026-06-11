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
const getDashboardColumnCardsQueryKey = (
  dashboardId: number,
  size: number,
  columnIds: number[],
) => [...QUERY_KEYS.columnCards(dashboardId), size, columnIds] as const;
type DashboardColumnCardsQueryKey = ReturnType<
  typeof getDashboardColumnCardsQueryKey
>;
type UseDashboardColumnCardsQueryOptions<
  TData = DashboardColumnCardsQueryData,
> = Omit<
  UseQueryOptions<
    DashboardColumnCardsQueryData,
    Error,
    TData,
    DashboardColumnCardsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export const useDashboardColumnCardsQuery = <
  TData = DashboardColumnCardsQueryData,
>(
  { dashboardId, columns, size = 10 }: UseDashboardColumnCardsQueryParams,
  queryOptions?: UseDashboardColumnCardsQueryOptions<TData>,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const hasColumns = columns.length > 0;
  const isQueryEnabled = queryOptions?.enabled !== false;
  const columnIds = columns.map((column) => column.id);

  return useQuery<
    DashboardColumnCardsQueryData,
    Error,
    TData,
    DashboardColumnCardsQueryKey
  >({
    ...queryOptions,
    queryKey: getDashboardColumnCardsQueryKey(dashboardId, size, columnIds),
    queryFn: async () => {
      const results = await Promise.all(
        columns.map((col) => getCards(col.id, size)),
      );
      const map: Record<number, ColumnCardState> = {};

      columns.forEach((col, i) => {
        map[col.id] = {
          cards: results[i].cards,
          totalCount: results[i].totalCount,
          cursorId: results[i].cursorId,
        };
      });

      return map;
    },
    enabled: isDashboardIdValid && hasColumns && isQueryEnabled,
  });
};
