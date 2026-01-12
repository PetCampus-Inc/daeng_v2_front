import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateAnswers, checklistQueryKeys, type UpdateAnswersRequest } from '@entities/checklist';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const useChecklistMutate = (options?: Omit<UseMutationOptions<unknown, Error, UpdateAnswersRequest>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: rawOnSuccess,
    onSettled: rawOnSettled,
    ...restOptions
  } = options ?? {};

  const userOnSuccess = rawOnSuccess as
    | ((data: unknown, variables: UpdateAnswersRequest, context: unknown) => unknown)
    | undefined;
  const userOnSettled = rawOnSettled as
    | ((data: unknown | undefined, error: Error | null, variables: UpdateAnswersRequest, context: unknown) => unknown)
    | undefined;

  return useMutation({
    mutationFn: updateAnswers,
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: checklistQueryKeys.answers(variables.targetId) });
      userOnSuccess?.(data, variables, context);
    },
    onSettled: async (data, error, variables, context) => {
      syncWebViewQuery.invalidate(checklistQueryKeys.answers(variables.targetId));
      userOnSettled?.(data, error, variables, context);
    },
  });
};

export { useChecklistMutate };
