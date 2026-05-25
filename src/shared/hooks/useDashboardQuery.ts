import { getDashboard } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useDashboardQuery(dashboardId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(dashboardId),
    queryFn: () => getDashboard(dashboardId),
    enabled: !!dashboardId,
  });
}
