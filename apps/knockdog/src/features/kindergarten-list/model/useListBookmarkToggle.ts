import { type InfiniteData, type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';

import { bookmarkQueries, deleteBookmark, postBookmark } from '@entities/bookmark';
import { type KindergartenList } from '@entities/kindergarten';

export function useListBookmarkToggle(listQueryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
      return bookmarked ? deleteBookmark(id) : postBookmark(id);
    },
    onMutate: async ({ id, bookmarked }) => {
      const bookmarkKey = bookmarkQueries.keys.all();
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listQueryKey }),
        queryClient.cancelQueries({ queryKey: bookmarkKey }),
      ]);

      const previousListData = queryClient.getQueryData<InfiniteData<KindergartenList>>(listQueryKey);
      const previousBookmarks = queryClient.getQueryData(bookmarkKey);

      // 검색 리스트 캐시 낙관적 업데이트
      queryClient.setQueryData<InfiniteData<KindergartenList>>(listQueryKey, (prev) => {
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

      // 북마크 리스트 캐시 낙관적 업데이트
      if (previousBookmarks) {
        queryClient.setQueryData(bookmarkKey, (prev: unknown) => {
          if (!Array.isArray(prev)) return prev;
          if (bookmarked) {
            return prev.filter((item) => (item.shopId ?? item.id) !== id);
          } else {
            return [...prev, { id, shopId: id }];
          }
        });
      }

      return { previousListData, previousBookmarks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(listQueryKey, context.previousListData);
      }
      if (context?.previousBookmarks) {
        queryClient.setQueryData(bookmarkQueries.keys.all(), context.previousBookmarks);
      }
    },
  });
}
