import { getMembers } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

interface UseDashboardMembersQueryParams {
  dashboardId: number;
  page?: number;
  size?: number;
}

export function useDashboardMembersQuery({
  dashboardId,
  page = 1,
  size = 20,
}: UseDashboardMembersQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.membersPage(dashboardId, page, size),
    queryFn: () => getMembers(dashboardId, page, size),
    enabled: !!dashboardId,
  });
}
