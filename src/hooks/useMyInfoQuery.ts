import { getMyInfo } from '@/api/user';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useMyInfoQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMyInfo,
  });
}
