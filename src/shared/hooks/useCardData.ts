/**
 * @file 카드 조회 및 수정 커스텀 훅
 */

import { deleteCard } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useCardQuery } from '@/shared/hooks/useCardQuery';
import { useDashboardColumnsQuery } from '@/shared/hooks/useDashboardColumnsQuery';

export const useCardData = (cardId: number, dashboardId: number) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: card, isLoading, isError } = useCardQuery(cardId);
  const { data: columnsData, isError: isColumnsError } =
    useDashboardColumnsQuery(card?.dashboardId ?? 0);
  const columns = useMemo(() => columnsData?.data ?? [], [columnsData]);
  const resolvedErrorMessage =
    errorMessage ??
    (isColumnsError ? '컬럼 조회에 문제가 발생했습니다.' : null);

  /** columnTitle 조회 */
  const columnTitle = useMemo(() => {
    if (!card?.columnId || columns.length === 0) return '';
    return columns.find((col) => col.id === card.columnId)?.title ?? '';
  }, [card, columns]);

  /** 카드 삭제 핸들러 */
  const handleDeleteCard = async (onSuccess: () => void) => {
    try {
      await deleteCard(cardId);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.columnCards(dashboardId),
      });
      onSuccess();
    } catch {
      setErrorMessage('카드 삭제에 실패했습니다.');
    }
  };

  /** 수정 완료 핸들러 */
  const handleEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.columnCards(dashboardId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.card(cardId), // 카드 모달 업데이트
    });
  };

  return {
    card,
    isLoading,
    isError,
    columns,
    columnTitle,
    errorMessage: resolvedErrorMessage,
    setErrorMessage,
    handleDeleteCard,
    handleEditSuccess,
  };
};
