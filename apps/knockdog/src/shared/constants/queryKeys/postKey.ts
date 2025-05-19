//queryKey factory pattern
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (filter: { userId?: number }) =>
    [...postsKeys.lists(), filter] as const,

  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: number) => [...postsKeys.details(), id] as const,
};
