import { type InfiniteData, type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { bookmarkQueries, deleteBookmark, postBookmark } from '@entities/bookmark';
import { type KindergartenListWithMeta } from '@entities/kindergarten';

type CacheData = InfiniteData<KindergartenListWithMeta>;

export function useBookmarkToggle(queryKey?: QueryKey) {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
      if (bookmarked) {
        return deleteBookmark(id);
      }
      return postBookmark(id);
    },
    onMutate: async ({ id, bookmarked }) => {
      let previousData: CacheData | undefined;

      // 1. 검색 리스트 캐시 낙관적 업데이트
      if (queryKey) {
        await queryClient.cancelQueries({ queryKey });
        previousData = queryClient.getQueryData<CacheData>(queryKey);

        if (previousData) {
          queryClient.setQueryData<CacheData>(queryKey, (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                schoolResult: {
                  ...page.schoolResult,
                  exact:
                    page.schoolResult.exact?.id === id
                      ? { ...page.schoolResult.exact, bookmarked: !bookmarked }
                      : page.schoolResult.exact,
                  list: page.schoolResult.list.map((item) =>
                    item.id === id ? { ...item, bookmarked: !bookmarked } : item
                  ),
                },
              })),
            };
          });
        }
      }

      // 2. 북마크 리스트 캐시 낙관적 업데이트
      const bookmarkKey = bookmarkQueries.keys.all();
      await queryClient.cancelQueries({ queryKey: bookmarkKey });
      const previousBookmarks = queryClient.getQueryData(bookmarkKey);

      if (previousBookmarks) {
        queryClient.setQueryData(bookmarkKey, (prev: any) => {
          if (!Array.isArray(prev)) return prev;
          if (bookmarked) {
            return prev.filter((item) => (item.shopId ?? item.id) !== id);
          } else {
            return [...prev, { id, shopId: id }];
          }
        });
      }

      return { previousData, previousBookmarks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.previousBookmarks) {
        queryClient.setQueryData(bookmarkQueries.keys.all(), context.previousBookmarks);
      }
    },
  });

  const onBookmarkClick = useCallback(
    (id: string, bookmarked = false) => {
      mutate({ id, bookmarked });
    },
    [mutate]
  );

  return { onBookmarkClick };
}
