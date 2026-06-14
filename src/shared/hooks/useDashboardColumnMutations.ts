import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumn,
  updateColumn,
  deleteColumn,
} from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

interface UseDashboardColumnMutationsParams {
  dashboardId: number;
}

export const useDashboardColumnMutations = ({
  dashboardId,
}: UseDashboardColumnMutationsParams) => {
  const queryClient = useQueryClient();

  const invalidateColumns = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.columns(dashboardId),
    });
  };

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(title, dashboardId),
    onSuccess: invalidateColumns,
  });

  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: number; title: string }) =>
      updateColumn(columnId, title),
    onSuccess: invalidateColumns,
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: number) => deleteColumn(columnId),
    onSuccess: invalidateColumns,
  });

  return {
    createColumn: createColumnMutation.mutateAsync,
    updateColumn: updateColumnMutation.mutateAsync,
    deleteColumn: deleteColumnMutation.mutateAsync,
    isCreating: createColumnMutation.isPending,
    isUpdating: updateColumnMutation.isPending,
    isDeleting: deleteColumnMutation.isPending,
  };
};
