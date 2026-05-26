import { getColumns } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useDashboardColumnsQuery(dashboardId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.columns(dashboardId),
    queryFn: () => getColumns(dashboardId),
    enabled: !!dashboardId,
  });
}
