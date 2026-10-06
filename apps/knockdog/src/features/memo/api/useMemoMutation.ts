import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { updateMemo, memoQueryKeys, type MemoResponse, type UpdateMemoRequest, memoQueries } from '@entities/memo';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

interface MemoMutationContext<TUserContext> {
  userContext?: TUserContext;
}

export const useMemoMutation = <TUserContext = unknown>(
  options?: Omit<UseMutationOptions<MemoResponse, Error, UpdateMemoRequest, TUserContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const {
    onMutate: rawOnMutate,
    onError: rawOnError,
    onSuccess: rawOnSuccess,
    onSettled: rawOnSettled,
    ...restOptions
  } = options ?? {};

  const userOnMutate = rawOnMutate as
    | ((variables: UpdateMemoRequest) => Promise<TUserContext> | TUserContext)
    | undefined;
  const userOnError = rawOnError as
    | ((error: Error, variables: UpdateMemoRequest, context: TUserContext | undefined) => unknown)
    | undefined;
  const userOnSuccess = rawOnSuccess as
    | ((data: MemoResponse, variables: UpdateMemoRequest, context: TUserContext | undefined) => unknown)
    | undefined;
  const userOnSettled = rawOnSettled as
    | ((
        data: MemoResponse | undefined,
        error: Error | null,
        variables: UpdateMemoRequest,
        context: TUserContext | undefined
      ) => unknown)
    | undefined;

  return useMutation<MemoResponse, Error, UpdateMemoRequest, MemoMutationContext<TUserContext>>({
    ...restOptions,
    mutationFn: updateMemo as (variables: UpdateMemoRequest) => Promise<MemoResponse>,
    onMutate: async (variables) => {
      const userContext = await userOnMutate?.(variables);
      const context: MemoMutationContext<TUserContext> = { userContext };

      return context;
    },
    onError: (error, variables, context) => {
      userOnError?.(error, variables, context?.userContext);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: memoQueryKeys.byTargetId(variables.targetId) });
      queryClient.invalidateQueries({ queryKey: memoQueries.keys.all() });
      userOnSuccess?.(data, variables, context?.userContext);
    },
    onSettled: async (data, error, variables, context) => {
      syncWebViewQuery.invalidate(memoQueryKeys.byTargetId(variables.targetId));
      syncWebViewQuery.invalidate(memoQueries.keys.all());
      userOnSettled?.(data, error, variables, context?.userContext);
    },
  });
};
