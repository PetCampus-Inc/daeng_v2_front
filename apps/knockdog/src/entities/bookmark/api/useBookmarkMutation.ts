import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kindergartenMainQueryKeys, kindergartenNearQueryKeys } from '@entities/kindergarten';

import { deleteBookmark, postBookmark } from '../api/bookmark';

// post
const useBookmarkPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postBookmark(id),
    onSuccess: (_data, id) => {
      // 상세 캐시 토글
      queryClient.setQueriesData({ queryKey: kindergartenMainQueryKeys.byId(id) }, (prev: any) =>
        prev ? { ...prev, bookmarked: true } : prev
      );
      // 근처 리스트 캐시 토글
      queryClient.setQueriesData({ queryKey: kindergartenNearQueryKeys.all }, (prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((item) => (item?.id === id ? { ...item, bookmarked: true } : item));
      });
    },
  });
};

// delete
const useBookmarkDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: (_data, id) => {
      // 상세 캐시 토글
      queryClient.setQueriesData({ queryKey: kindergartenMainQueryKeys.byId(id) }, (prev: any) =>
        prev ? { ...prev, bookmarked: false } : prev
      );
      // 근처 리스트 캐시 토글
      queryClient.setQueriesData({ queryKey: kindergartenNearQueryKeys.all }, (prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((item) => (item?.id === id ? { ...item, bookmarked: false } : item));
      });
    },
  });
};

export { useBookmarkPostMutation, useBookmarkDeleteMutation };
