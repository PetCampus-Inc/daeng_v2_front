import { queryOptions } from '@tanstack/react-query';
import { getBookmarks } from '@entities/bookmark';
import { bookmarkQueryKeys } from '@entities/bookmark/config/bookmarkQueryKeys';

export const bookmarkQueryOptions = {
  list: (enabled = false) => {
    return queryOptions({
      queryKey: bookmarkQueryKeys.all,
      queryFn: getBookmarks,
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      initialData: [],
    });
  },
};
