import { getMyInvitations } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseMyInvitationsInfiniteQueryParams {
  size?: number;
}

export function useMyInvitationsInfiniteQuery({
  size = 10,
}: UseMyInvitationsInfiniteQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.myInvitations(size),
    queryFn: ({ pageParam }) => getMyInvitations(size, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.cursorId ?? null,
  });
}
