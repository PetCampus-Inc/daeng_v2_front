import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateAnswers, checklistQueryKeys, type UpdateAnswersRequest } from '@entities/checklist';

const useChecklistMutate = (
  options?: Omit<UseMutationOptions<unknown, Error, UpdateAnswersRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnswers,
    onSuccess: async (...args) => {
      const [, variables] = args;
      await queryClient.invalidateQueries({ queryKey: checklistQueryKeys.answers(variables.targetId) });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export { useChecklistMutate };
