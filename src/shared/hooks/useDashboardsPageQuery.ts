import { getDashboards } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

interface UseDashboardsPageQueryParams {
  page: number;
  size: number;
  enabled?: boolean;
}

type DashboardsPageQueryData = Awaited<ReturnType<typeof getDashboards>>;
type DashboardsPageQueryKey = ReturnType<typeof QUERY_KEYS.dashboardsPage>;
type UseDashboardsPageQueryOptions<TData = DashboardsPageQueryData> = Omit<
  UseQueryOptions<
    DashboardsPageQueryData,
    Error,
    TData,
    DashboardsPageQueryKey
  >,
  'queryKey' | 'queryFn' | 'enabled'
>;

export const useDashboardsPageQuery = <TData = DashboardsPageQueryData>({
  page,
  size,
  enabled = true,
  queryOptions,
}: UseDashboardsPageQueryParams & {
  queryOptions?: UseDashboardsPageQueryOptions<TData>;
}) => {
  return useQuery<
    DashboardsPageQueryData,
    Error,
    TData,
    DashboardsPageQueryKey
  >({
    ...queryOptions,
    queryKey: QUERY_KEYS.dashboardsPage(page, size),
    queryFn: () => getDashboards(page, size),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};
