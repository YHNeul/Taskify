import { readCard } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { Card } from '@/shared/types/dashboard';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type CardQueryKey = ReturnType<typeof QUERY_KEYS.card>;
type UseCardQueryOptions<TData = Card> = Omit<
  UseQueryOptions<Card, Error, TData, CardQueryKey>,
  'queryKey' | 'queryFn'
>;

/**
 * 단일 카드 상세 정보를 조회하는 공용 React Query 훅
 *
 * @param cardId 조회할 카드 ID. 유효한 양의 정수가 아닐 경우 쿼리는 비활성화 된다.
 * @param queryOptions 호출부에서 주입할 React Query 옵션.
 * `enabled`를 전달하면 내부 카드 ID 유효성 조건과 함께 결합되어 최종 활성화 여부가 결정된다.
 * @returns 카드 조회 결과와 로딩/에러 상태를 포함한 React Query 결과 객체를 반환한다.
 */
export const useCardQuery = <TData = Card>(
  cardId: number,
  queryOptions?: UseCardQueryOptions<TData>,
) => {
  const isCardIdValid = Number.isFinite(cardId) && cardId > 0;
  const isQueryEnabled = queryOptions?.enabled !== false;

  return useQuery<Card, Error, TData, CardQueryKey>({
    ...queryOptions,
    queryKey: QUERY_KEYS.card(cardId),
    queryFn: () => readCard(cardId),
    enabled: isCardIdValid && isQueryEnabled,
  });
};
