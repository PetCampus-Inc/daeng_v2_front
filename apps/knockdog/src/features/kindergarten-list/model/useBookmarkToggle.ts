import { type InfiniteData, type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useBookmarkDeleteMutation, useBookmarkPostMutation } from '@entities/bookmark/api/useBookmarkMutation';
import { type KindergartenListWithMeta, type Kindergarten } from '@entities/kindergarten';

type CacheData = InfiniteData<KindergartenListWithMeta> | Kindergarten;

export function useBookmarkToggle(queryKey?: QueryKey) {
  const queryClient = useQueryClient();
  const { mutate: postBookmark } = useBookmarkPostMutation();
  const { mutate: deleteBookmark } = useBookmarkDeleteMutation();

  const toggleBookmarkInCache = useCallback(
    (id: string, bookmarked: boolean) => {
      if (!queryKey) {
        return;
      }
      queryClient.setQueryData<CacheData>(queryKey, (prev) => {
        if (!prev) return prev;
        if ('pages' in prev && Array.isArray(prev.pages)) {
          // 1. InfiniteQuery 데이터 구조일 경우의 로직 (list View)
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
        } else {
          // 2. 단일 객체 데이터 구조일 경우의 로직 (detail view)
          const prevKindergarten = prev as Kindergarten;
          if (prevKindergarten.id === id) {
            return { ...prevKindergarten, bookmarked };
          }
          return prevKindergarten;
        }
      });
    },
    [queryKey, queryClient]
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
