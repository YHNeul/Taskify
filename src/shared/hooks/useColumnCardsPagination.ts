import { useState, useCallback } from 'react';
import { getCards } from '@/shared/apis/dashboard';
import { ColumnCardState } from '@/shared/hooks/useBoardDnd';

interface UseColumnCardsPaginationParams {
  setColumnCards: React.Dispatch<
    React.SetStateAction<Record<number, ColumnCardState>>
  >;
  onLoadMoreError?: () => void;
}

export const useColumnCardsPagination = ({
  setColumnCards,
  onLoadMoreError,
}: UseColumnCardsPaginationParams) => {
  const [loadingColumnIds, setLoadingColumnIds] = useState<Set<number>>(
    new Set(),
  );

  const loadMoreCards = useCallback(
    async (columnId: number, cursorId: number | null | undefined) => {
      if (cursorId === null || cursorId === undefined) return;

      setLoadingColumnIds((prev) => {
        const next = new Set(prev);
        next.add(columnId);
        return next;
      });

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
      } catch {
        onLoadMoreError?.();
      } finally {
        setLoadingColumnIds((prev) => {
          const next = new Set(prev);
          next.delete(columnId);
          return next;
        });
      }
    },
    [onLoadMoreError, setColumnCards],
  );

  return {
    loadingColumnIds,
    loadMoreCards,
  };
};
