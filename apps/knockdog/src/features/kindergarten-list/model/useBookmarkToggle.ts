import { type InfiniteData, type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBookmarkDeleteMutation, useBookmarkPostMutation } from '@entities/bookmark/api/useBookmarkMutation';
import { type KindergartenListWithMeta } from '@entities/kindergarten';

export function useBookmarkToggle(listQueryKey?: QueryKey) {
  const queryClient = useQueryClient();
  const { mutate: postBookmark } = useBookmarkPostMutation();
  const { mutate: deleteBookmark } = useBookmarkDeleteMutation();

  const toggleBookmarkInCache = useCallback(
    (id: string, bookmarked: boolean) => {
      if (!listQueryKey) return;
      queryClient.setQueryData<InfiniteData<KindergartenListWithMeta>>(listQueryKey, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            schoolResult: {
              ...page.schoolResult,
              exact:
                page.schoolResult.exact?.id === id
                  ? { ...page.schoolResult.exact, isBookmarked: bookmarked }
                  : page.schoolResult.exact,
              list: page.schoolResult.list.map((item) =>
                item.id === id ? { ...item, isBookmarked: bookmarked } : item
              ),
            },
          })),
        };
      });
    },
    [listQueryKey, queryClient]
  );

  const onBookmarkClick = useCallback(
    (id: string, isBookmarked = false) => {
      if (isBookmarked) {
        deleteBookmark(id, {
          onSuccess: () => toggleBookmarkInCache(id, false),
        });
      } else {
        postBookmark(id, {
          onSuccess: () => toggleBookmarkInCache(id, true),
        });
      }
    },
    [deleteBookmark, postBookmark, toggleBookmarkInCache]
  );

  return { onBookmarkClick };
}
