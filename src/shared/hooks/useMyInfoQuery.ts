import { getMyInfo } from '@/shared/apis/user';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type MyInfoQueryData = Awaited<ReturnType<typeof getMyInfo>>;
type MyInfoQueryKey = ReturnType<typeof QUERY_KEYS.me>;
type UseMyInfoQueryOptions<TData = MyInfoQueryData> = Omit<
  UseQueryOptions<MyInfoQueryData, Error, TData, MyInfoQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useMyInfoQuery = <TData = MyInfoQueryData>(
  queryOptions?: UseMyInfoQueryOptions<TData>,
) => {
  return useQuery<MyInfoQueryData, Error, TData, MyInfoQueryKey>({
    ...queryOptions,
    queryKey: QUERY_KEYS.me(),
    queryFn: getMyInfo,
  });
};
