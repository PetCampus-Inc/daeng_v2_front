import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
  deleteChecklist,
  updateAnswers,
  checklistQueryKeys,
  type DeleteChecklistRequest,
  type UpdateAnswersRequest,
} from '@entities/checklist';
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

const useDeleteChecklistMutation = <TContext = unknown>(
  options?: Omit<UseMutationOptions<void, Error, DeleteChecklistRequest, TContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const { onSuccess: userOnSuccess, onSettled: userOnSettled, ...restOptions } = options ?? {};

  return useMutation<void, Error, DeleteChecklistRequest, TContext>({
    ...restOptions,
    mutationFn: deleteChecklist,
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: checklistQueryKeys.answers(variables.targetId) });
      userOnSuccess?.(data, variables, context, mutationContext);
    },
    onSettled: (data, error, variables, context, mutationContext) => {
      syncWebViewQuery.invalidate(checklistQueryKeys.answers(variables.targetId));
      userOnSettled?.(data, error, variables, context, mutationContext);
    },
  });
};

export { useChecklistMutate, useDeleteChecklistMutation };
