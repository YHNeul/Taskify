import { getCards } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Column } from '@/types/dashboard';
import { useQuery } from '@tanstack/react-query';
import { ColumnCardState } from '@/hooks/useBoardDnd';

interface UseDashboardColumnCardsQueryParams {
  dashboardId: number;
  columns: Column[];
  size?: number;
}

export function useDashboardColumnCardsQuery({
  dashboardId,
  columns,
  size = 10,
}: UseDashboardColumnCardsQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.columnCards(dashboardId),
    queryFn: async () => {
      const results = await Promise.all(columns.map((col) => getCards(col.id, size)));
      const map: Record<number, ColumnCardState> = {};

      columns.forEach((col, i) => {
        map[col.id] = {
          cards: results[i].cards,
          totalCount: results[i].totalCount,
          cursorId: results[i].cursorId,
        };
      });

      return map;
    },
    enabled: !!dashboardId && columns.length > 0,
  });
}
