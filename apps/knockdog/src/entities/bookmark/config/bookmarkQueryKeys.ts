import { deleteBookmark, postBookmark } from '../api/bookmark';

// TODO: bookmark query key 위치 논의: entities vs shared
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
