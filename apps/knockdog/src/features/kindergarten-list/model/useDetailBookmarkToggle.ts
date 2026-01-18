import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bookmarkQueries, deleteBookmark, postBookmark } from '@entities/bookmark';
import { kindergartenQueries, type KindergartenMain } from '@entities/kindergarten';

type MutationVars = { id: string; bookmarked: boolean };
type DetailParams = { id: string; lng: number; lat: number };

export function useDetailBookmarkToggle(params: DetailParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bookmarked }: MutationVars) => {
      return bookmarked ? deleteBookmark(id) : postBookmark(id);
    },
    onMutate: async ({ id, bookmarked }) => {
      const detailQueryKey = kindergartenQueries.keys.main({
        id: params.id,
        lng: params.lng,
        lat: params.lat,
      });
      const bookmarkKey = bookmarkQueries.keys.all();

      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailQueryKey }),
        queryClient.cancelQueries({ queryKey: bookmarkKey }),
      ]);

      const previousDetail = queryClient.getQueryData<KindergartenMain>(detailQueryKey);
      const previousBookmarks = queryClient.getQueryData(bookmarkKey);

      queryClient.setQueryData<KindergartenMain>(detailQueryKey, (prev) => {
        if (!prev) return prev;
        return { ...prev, bookmarked: !bookmarked };
      });

      if (previousBookmarks) {
        queryClient.setQueryData(bookmarkKey, (prev: unknown) => {
          if (!Array.isArray(prev)) return prev;
          if (bookmarked) {
            return prev.filter((item) => (item?.shopId ?? item?.id) !== id);
          }
          return [...prev, { id, shopId: id }];
        });
      }

      return {
        previousDetail,
        previousBookmarks,
      };
    },
    onSuccess: () => {
      // 북마크 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: bookmarkQueries.keys.all() });
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetail) {
        const detailQueryKey = kindergartenQueries.keys.main({
          id: params.id,
          lng: params.lng,
          lat: params.lat,
        });
        queryClient.setQueryData(detailQueryKey, context.previousDetail);
      }
      if (context?.previousBookmarks) {
        queryClient.setQueryData(bookmarkQueries.keys.all(), context.previousBookmarks);
      }
    },
  });
}
