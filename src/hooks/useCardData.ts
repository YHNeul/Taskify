/**
 * @file 카드 조회 및 수정 커스텀 훅
 */

import { deleteCard, getColumns, readCard } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Column } from '@/types/dashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export default function useCardData(cardId: number, dashboardId: number) {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<Column[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: card,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => readCard(cardId),
  });

  /** 컬럼 조회 */
  useEffect(() => {
    if (!card?.dashboardId) return;
    getColumns(card.dashboardId)
      .then((res) => setColumns(res.data))
      .catch(() => setErrorMessage('컬럼 조회에 문제가 발생했습니다.'));
  }, [card?.dashboardId]);

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
        queryKey: [...QUERY_KEYS.columns(dashboardId), 'cards'],
      });
      onSuccess();
    } catch {
      setErrorMessage('카드 삭제에 실패했습니다.');
    }
  };

  /** 수정 완료 핸들러 */
  const handleEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [...QUERY_KEYS.columns(dashboardId), 'cards'],
    });
    queryClient.invalidateQueries({
      queryKey: ['card', cardId], // 카드 모달 업데이트
    });
  };

  return {
    card,
    isLoading,
    isError,
    columns,
    columnTitle,
    errorMessage,
    setErrorMessage,
    handleDeleteCard,
    handleEditSuccess,
  };
}
