import { getDashboard } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type DashboardQueryData = Awaited<ReturnType<typeof getDashboard>>;
type DashboardQueryKey = ReturnType<typeof QUERY_KEYS.dashboard>;
type UseDashboardQueryOptions<TData = DashboardQueryData> = Omit<
  UseQueryOptions<DashboardQueryData, Error, TData, DashboardQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useDashboardQuery = <TData = DashboardQueryData>(
  dashboardId: number,
  queryOptions?: UseDashboardQueryOptions<TData>,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const isQueryEnabled = queryOptions?.enabled ?? true;

  return useQuery<DashboardQueryData, Error, TData, DashboardQueryKey>({
    ...queryOptions,
    queryKey: QUERY_KEYS.dashboard(dashboardId),
    queryFn: () => getDashboard(dashboardId),
    enabled: isDashboardIdValid && isQueryEnabled,
    staleTime: queryOptions?.staleTime ?? 1000 * 60 * 3,
    gcTime: queryOptions?.gcTime ?? 1000 * 60 * 30,
  });
};
