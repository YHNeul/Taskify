import { getMembers } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

interface UseDashboardMembersQueryParams {
  dashboardId: number;
  page?: number;
  size?: number;
}

type DashboardMembersQueryData = Awaited<ReturnType<typeof getMembers>>;
type DashboardMembersQueryKey = ReturnType<typeof QUERY_KEYS.membersPage>;
type UseDashboardMembersQueryOptions<TData = DashboardMembersQueryData> = Omit<
  UseQueryOptions<
    DashboardMembersQueryData,
    Error,
    TData,
    DashboardMembersQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export const useDashboardMembersQuery = <TData = DashboardMembersQueryData>(
  { dashboardId, page = 1, size = 20 }: UseDashboardMembersQueryParams,
  queryOptions?: UseDashboardMembersQueryOptions<TData>,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const isQueryEnabled = queryOptions?.enabled !== false;

  return useQuery<
    DashboardMembersQueryData,
    Error,
    TData,
    DashboardMembersQueryKey
  >({
    ...queryOptions,
    queryKey: QUERY_KEYS.membersPage(dashboardId, page, size),
    queryFn: () => getMembers(dashboardId, page, size),
    enabled: isDashboardIdValid && isQueryEnabled,
  });
};
