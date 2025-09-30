import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { updateMemo, memoQueryKeys, type MemoResponse, type UpdateMemoRequest } from '@entities/memo';

export const useMemoMutation = (
  options?: Omit<UseMutationOptions<MemoResponse, Error, UpdateMemoRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemo as (variables: UpdateMemoRequest) => Promise<MemoResponse>,
    onSuccess: (...args) => {
      const [data, variables] = args;
      queryClient.setQueryData<MemoResponse>(memoQueryKeys.byTargetId(variables.targetId), data);
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
