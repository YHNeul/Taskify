import { getMyInfo } from '@/shared/apis/user';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useMyInfoQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMyInfo,
  });
}
