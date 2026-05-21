import { getInvitations } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

interface UseDashboardInvitationsQueryParams {
  dashboardId: number;
  page: number;
  size: number;
}

export function useDashboardInvitationsQuery({
  dashboardId,
  page,
  size,
}: UseDashboardInvitationsQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.invitations(dashboardId, page),
    queryFn: () => getInvitations(dashboardId, page, size),
    enabled: !!dashboardId,
  });
}
