import { useQuery } from '@tanstack/react-query';
import { getBookmarksQueryOptions } from '@entities/bookmark';

function useBookmarksQuery() {
  return useQuery({
    ...getBookmarksQueryOptions(),
  });
}
export { useBookmarksQuery };
