import { readCard } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useCardQuery(cardId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.card(cardId),
    queryFn: () => readCard(cardId),
    enabled: !!cardId,
  });
}
