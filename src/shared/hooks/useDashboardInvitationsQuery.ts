import { getInvitations } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

interface UseDashboardInvitationsQueryParams {
  dashboardId: number;
  page: number;
  size: number;
}

type DashboardInvitationsQueryData = Awaited<ReturnType<typeof getInvitations>>;
type DashboardInvitationsQueryKey = ReturnType<typeof QUERY_KEYS.invitations>;
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
    queryKey: QUERY_KEYS.invitations(dashboardId, page),
    queryFn: () => getInvitations(dashboardId, page, size),
    enabled: isDashboardIdValid && isQueryEnabled,
  });
};
