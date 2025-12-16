import { queryOptions } from '@tanstack/react-query';
import { getMemoList } from '../api/memo';

export const memoQueries = {
  keys: {
    all: () => ['memo'] as const,
  },

  list: () =>
    queryOptions({
      queryKey: memoQueries.keys.all(),
      queryFn: () => getMemoList(),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }),
};
