import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComparisonHistory, comparisonsQueryKeys } from '@entities/compare';
import { ApiResponse } from '@shared/api';

function useDeleteComparisonHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, number>({
    mutationFn: (id: number) => deleteComparisonHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comparisonsQueryKeys.history() });
    },
  });
}

export { useDeleteComparisonHistoryMutation };
