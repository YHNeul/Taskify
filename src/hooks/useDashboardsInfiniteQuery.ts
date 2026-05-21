import { getDashboards } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseDashboardsInfiniteQueryParams {
  size: number;
  enabled?: boolean;
}

export function useDashboardsInfiniteQuery({
  size,
  enabled = true,
}: UseDashboardsInfiniteQueryParams) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.dashboardsInfinite(size),
    queryFn: ({ pageParam }) => getDashboards(pageParam as number, size),
    getNextPageParam: (lastPage, pages) => {
      const total = Math.ceil(lastPage.totalCount / size);
      return pages.length < total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
  });
}
