import { queryOptions } from '@tanstack/react-query';
import { getBookmarks } from '@entities/bookmark';

export const bookmarkQueries = {
  keys: {
    all: () => ['bookmark'] as const,
  },

  list: (enabled = false) =>
    queryOptions({
      queryKey: bookmarkQueries.keys.all(),
      queryFn: () => getBookmarks(),
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      initialData: [],
    }),
};
