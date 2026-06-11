import { getColumns } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type DashboardColumnsQueryData = Awaited<ReturnType<typeof getColumns>>;
type DashboardColumnsQueryKey = ReturnType<typeof QUERY_KEYS.columns>;
type UseDashboardColumnsQueryOptions<TData = DashboardColumnsQueryData> = Omit<
  UseQueryOptions<
    DashboardColumnsQueryData,
    Error,
    TData,
    DashboardColumnsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export const useDashboardColumnsQuery = <TData = DashboardColumnsQueryData>(
  dashboardId: number,
  queryOptions?: UseDashboardColumnsQueryOptions<TData>,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const isQueryEnabled = queryOptions?.enabled ?? true;

  return useQuery<
    DashboardColumnsQueryData,
    Error,
    TData,
    DashboardColumnsQueryKey
  >({
    ...queryOptions,
    queryKey: QUERY_KEYS.columns(dashboardId),
    queryFn: () => getColumns(dashboardId),
    enabled: isDashboardIdValid && isQueryEnabled,
  });
};
