import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { createMemoQueryOptions, type MemoResponse } from '@entities/memo';

// 훅
export const useMemoQuery = (
  targetId: string,
  options?: Omit<UseQueryOptions<MemoResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    ...createMemoQueryOptions(targetId),
    ...options,
  });
};
