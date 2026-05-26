import { getMe } from '@/shared/apis/auth';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useMeQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMe,
  });
}
