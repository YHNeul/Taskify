import { getDashboards } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

interface UseDashboardsPageQueryParams {
  page: number;
  size: number;
  enabled?: boolean;
}

export function useDashboardsPageQuery({
  page,
  size,
  enabled = true,
}: UseDashboardsPageQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardsPage(page, size),
    queryFn: () => getDashboards(page, size),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
