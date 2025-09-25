import { deleteBookmark, postBookmark } from '../api/bookmark';

const bookmarkQueryKeys = {
  all: ['bookmark'] as const,
  byId: (id: string) => [...bookmarkQueryKeys.all, id] as const,
} as const;

const createBookmarkQueryOptions = (id: string) => ({
  queryFn: () => postBookmark(id),
});

const deleteBookmarkQueryOptions = (id: string) => ({
  queryKey: bookmarkQueryKeys.byId(id),
  queryFn: () => deleteBookmark(id),
});

export { bookmarkQueryKeys, createBookmarkQueryOptions, deleteBookmarkQueryOptions };
