import { getMe } from '@/api/auth';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useMeQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMe,
  });
}
