import { useState } from 'react';
import { getCards } from '@/shared/apis/dashboard';
import { ColumnCardState } from '@/shared/hooks/useBoardDnd';

interface UseColumnCardsPaginationParams {
  setColumnCards: React.Dispatch<
    React.SetStateAction<Record<number, ColumnCardState>>
  >;
}

export const useColumnCardsPagination = ({
  setColumnCards,
}: UseColumnCardsPaginationParams) => {
  const [loadingColumnIds, setLoadingColumnIds] = useState<Set<number>>(
    new Set(),
  );

  const loadMoreCards = async (columnId: number, cursorId: number) => {
    setLoadingColumnIds((prev) => new Set(prev).add(columnId));

    try {
      const result = await getCards(columnId, 10, cursorId);
      setColumnCards((prev) => ({
        ...prev,
        [columnId]: {
          cards: [...(prev[columnId]?.cards ?? []), ...result.cards],
          totalCount: result.totalCount,
          cursorId: result.cursorId,
        },
      }));
    } finally {
      setLoadingColumnIds((prev) => {
        const next = new Set(prev);
        next.delete(columnId);
        return next;
      });
    }
  };

  return {
    loadingColumnIds,
    loadMoreCards,
  };
};
