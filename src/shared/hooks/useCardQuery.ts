import { readCard } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { Card } from '@/shared/types/dashboard';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type CardQueryKey = ReturnType<typeof QUERY_KEYS.card>;
type UseCardQueryOptions<TData = Card> = Omit<
  UseQueryOptions<Card, Error, TData, CardQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useCardQuery = <TData = Card>(
  cardId: number,
  queryOptions?: UseCardQueryOptions<TData>,
) => {
  const isCardIdValid = Number.isFinite(cardId) && cardId > 0;
  const isQueryEnabled =
    typeof queryOptions?.enabled === 'boolean' ? queryOptions.enabled : true;

  return useQuery<Card, Error, TData, CardQueryKey>({
    ...queryOptions,
    queryKey: QUERY_KEYS.card(cardId),
    queryFn: () => readCard(cardId),
    enabled: isCardIdValid && isQueryEnabled,
  });
};
