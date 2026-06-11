import { getMe } from '@/shared/apis/auth';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type MeQueryData = Awaited<ReturnType<typeof getMe>>;
type MeQueryKey = ReturnType<typeof QUERY_KEYS.me>;
type UseMeQueryOptions<TData = MeQueryData> = Omit<
  UseQueryOptions<MeQueryData, Error, TData, MeQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useMeQuery = <TData = MeQueryData>(
  queryOptions?: UseMeQueryOptions<TData>,
) => {
  return useQuery<MeQueryData, Error, TData, MeQueryKey>({
    ...queryOptions,
    queryKey: QUERY_KEYS.me(),
    queryFn: getMe,
  });
};
