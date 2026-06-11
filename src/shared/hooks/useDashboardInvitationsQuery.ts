import { getInvitations } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

interface UseDashboardInvitationsQueryParams {
  dashboardId: number;
  page: number;
  size: number;
}

type DashboardInvitationsQueryData = Awaited<ReturnType<typeof getInvitations>>;
const getDashboardInvitationsQueryKey = (
  dashboardId: number,
  page: number,
  size: number,
) => [...QUERY_KEYS.invitations(dashboardId, page), size] as const;
type DashboardInvitationsQueryKey = ReturnType<
  typeof getDashboardInvitationsQueryKey
>;
type UseDashboardInvitationsQueryOptions<
  TData = DashboardInvitationsQueryData,
> = Omit<
  UseQueryOptions<
    DashboardInvitationsQueryData,
    Error,
    TData,
    DashboardInvitationsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export const useDashboardInvitationsQuery = <
  TData = DashboardInvitationsQueryData,
>(
  { dashboardId, page, size }: UseDashboardInvitationsQueryParams,
  queryOptions?: UseDashboardInvitationsQueryOptions<TData>,
) => {
  const isDashboardIdValid = Number.isFinite(dashboardId) && dashboardId > 0;
  const isQueryEnabled = queryOptions?.enabled !== false;

  return useQuery<
    DashboardInvitationsQueryData,
    Error,
    TData,
    DashboardInvitationsQueryKey
  >({
    ...queryOptions,
    queryKey: getDashboardInvitationsQueryKey(dashboardId, page, size),
    queryFn: () => getInvitations(dashboardId, page, size),
    enabled: isDashboardIdValid && isQueryEnabled,
  });
};
