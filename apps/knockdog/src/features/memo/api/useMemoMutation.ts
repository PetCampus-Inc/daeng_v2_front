import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { updateMemo, memoQueryKeys, type MemoResponse, type UpdateMemoRequest } from '@entities/memo';

interface MemoMutationContext {
  previous: MemoResponse | undefined;
  userContext?: unknown;
}

export const useMemoMutation = (
  options?: Omit<UseMutationOptions<MemoResponse, Error, UpdateMemoRequest, MemoMutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const {
    onMutate: rawOnMutate,
    onError: rawOnError,
    onSuccess: rawOnSuccess,
    onSettled: rawOnSettled,
    ...restOptions
  } = options ?? {};

  const userOnMutate = rawOnMutate as ((variables: UpdateMemoRequest) => Promise<unknown> | unknown) | undefined;
  const userOnError = rawOnError as
    | ((error: Error, variables: UpdateMemoRequest, context: unknown) => unknown)
    | undefined;
  const userOnSuccess = rawOnSuccess as
    | ((data: MemoResponse, variables: UpdateMemoRequest, context: unknown) => unknown)
    | undefined;
  const userOnSettled = rawOnSettled as
    | ((data: MemoResponse | undefined, error: Error | null, variables: UpdateMemoRequest, context: unknown) => unknown)
    | undefined;

  return useMutation({
    ...restOptions,
    mutationFn: updateMemo as (variables: UpdateMemoRequest) => Promise<MemoResponse>,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: memoQueryKeys.byTargetId(variables.targetId) });

      const previous = queryClient.getQueryData<MemoResponse>(memoQueryKeys.byTargetId(variables.targetId));

      if (previous) {
        const optimistic: MemoResponse = {
          content: variables.content ?? previous.content,
          photos: variables.photos ?? previous.photos,
        };

        queryClient.setQueryData<MemoResponse>(memoQueryKeys.byTargetId(variables.targetId), optimistic);
      }

      const userContext = await userOnMutate?.(variables);
      const context: MemoMutationContext = { previous, userContext };

      return context;
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<MemoResponse>(memoQueryKeys.byTargetId(variables.targetId), context.previous);
      }
      userOnError?.(error, variables, context?.userContext);
    },
    onSuccess: (data, variables, context) => {
      userOnSuccess?.(data, variables, context?.userContext);
    },
    onSettled: async (data, error, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: memoQueryKeys.byTargetId(variables.targetId) });
      userOnSettled?.(data, error, variables, context?.userContext);
    },
  });
};
