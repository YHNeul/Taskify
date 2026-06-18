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

  const queries = useQueries({
    queries: columns.map((column) => ({
      ...queryOptions,
      queryKey: getColumnCardsQueryKey(dashboardId, size, column.id),
      queryFn: () => getCards(column.id, size),
      enabled: isDashboardIdValid && hasColumns && isQueryEnabled,
      staleTime: queryOptions?.staleTime ?? 1000 * 30,
      gcTime: queryOptions?.gcTime ?? 1000 * 60 * 10,
    })),
  });

  const dataMap: DashboardColumnCardsQueryData = {};
  queries.forEach((query, index) => {
    const result = query.data;
    const columnId = columns[index]?.id;
    if (!result || !columnId) return;
    dataMap[columnId] = {
      cards: result.cards,
      totalCount: result.totalCount,
      cursorId: result.cursorId,
    };
  });

  return {
    data: Object.keys(dataMap).length > 0 ? dataMap : undefined,
    dataVersion: queries.map((query) => query.dataUpdatedAt).join('|'),
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
  };
};
