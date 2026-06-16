import { getCards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { Column } from '@/shared/types/dashboard';
import { ColumnCardState } from '@/shared/hooks/useBoardDnd';
import {
  useQueries,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

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
type UseDashboardColumnCardsQueryOptions<
  TQueryFnData = Awaited<ReturnType<typeof getCards>>,
> = Omit<
  UseQueryOptions<TQueryFnData, Error, TQueryFnData>,
  'queryKey' | 'queryFn'
>;

export const useDashboardColumnCardsQuery = <
  TData = DashboardColumnCardsQueryData,
>(
  { dashboardId, columns, size = 10 }: UseDashboardColumnCardsQueryParams,
  queryOptions?: UseDashboardColumnCardsQueryOptions,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const hasColumns = columns.length > 0;
  const isQueryEnabled = queryOptions?.enabled !== false;
  const IMMEDIATE_COLUMN_COUNT = 2;

  const { data: isDeferredBatchEnabled = false } = useQuery<
    boolean,
    Error,
    boolean,
    readonly ['dashboard-column-cards-defer', number, number]
  >({
    queryKey: ['dashboard-column-cards-defer', dashboardId, columns.length],
    queryFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      return true;
    },
    enabled: isDashboardIdValid && hasColumns && isQueryEnabled,
    staleTime: Infinity,
    gcTime: 1000 * 60,
  });

  const queries = useQueries({
    queries: columns.map((column, index) => ({
      ...queryOptions,
      queryKey: getColumnCardsQueryKey(dashboardId, size, column.id),
      queryFn: () => getCards(column.id, size),
      enabled:
        isDashboardIdValid &&
        hasColumns &&
        isQueryEnabled &&
        (index < IMMEDIATE_COLUMN_COUNT || isDeferredBatchEnabled),
      staleTime: queryOptions?.staleTime ?? 1000 * 30,
      gcTime: queryOptions?.gcTime ?? 1000 * 60 * 10,
    })),
  });
  const map: Record<number, ColumnCardState> = {};
  columns.forEach((column, index) => {
    const result = queries[index]?.data;
    if (!result) return;
    map[column.id] = {
      cards: result.cards,
      totalCount: result.totalCount,
      cursorId: result.cursorId,
    };
  });
  const data = (Object.keys(map).length > 0 ? map : undefined) as
    | TData
    | undefined;

  return {
    data,
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
  };
};
