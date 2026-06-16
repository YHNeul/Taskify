import { getCards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { Column } from '@/shared/types/dashboard';
import { ColumnCardState } from '@/shared/hooks/useBoardDnd';
import { useMemo } from 'react';
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
type UseDashboardColumnCardsQueryOptions<
  TData = DashboardColumnCardsQueryData,
> = Omit<
  UseQueryOptions<
    Awaited<ReturnType<typeof getCards>>,
    Error,
    Awaited<ReturnType<typeof getCards>>
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
  const isQueryEnabled = queryOptions?.enabled ?? true;

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

  const data = useMemo(() => {
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

    return Object.keys(map).length > 0 ? (map as TData) : undefined;
  }, [columns, queries]);

  return {
    data,
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
  };
};
