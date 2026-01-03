import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kindergartenMainQueryKeys, kindergartenNearQueryKeys } from '@entities/kindergarten';
import { bookmarkQueryKeys } from '../config/bookmarkQueryKeys';
import { useUserStore } from '@entities/user';

import { deleteBookmark, postBookmark } from '../api/bookmark';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

// post
const useBookmarkPostMutation = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const userId = user?.userId ?? 'guest';

  return useMutation({
    mutationFn: (id: string) => postBookmark(id),
    onSuccess: (_data, id) => {
      // 상세 캐시 토글
      queryClient.setQueriesData({ queryKey: kindergartenMainQueryKeys.byId(id, userId) }, (prev: any) =>
        prev ? { ...prev, bookmarked: true } : prev
      );
      // 근처 리스트 캐시 토글 (현재 사용자의 모든 근처 리스트 쿼리 업데이트)
      queryClient.setQueriesData({ queryKey: kindergartenNearQueryKeys.all }, (prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((item) => (item?.id === id ? { ...item, bookmarked: true } : item));
      });
      // queryClient.invalidateQueries({ queryKey: bookmarkQueryKeys.all });
      syncWebViewQuery.invalidate(bookmarkQueryKeys.all);
    },
  });
};

// delete
const useBookmarkDeleteMutation = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const userId = user?.userId ?? 'guest';

  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: (_data, id) => {
      // 상세 캐시 토글
      queryClient.setQueriesData({ queryKey: kindergartenMainQueryKeys.byId(id, userId) }, (prev: any) =>
        prev ? { ...prev, bookmarked: false } : prev
      );
      // 근처 리스트 캐시 토글 (현재 사용자의 모든 근처 리스트 쿼리 업데이트)
      queryClient.setQueriesData({ queryKey: kindergartenNearQueryKeys.all }, (prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((item) => (item?.id === id ? { ...item, bookmarked: false } : item));
      });
      // queryClient.invalidateQueries({ queryKey: bookmarkQueryKeys.all });
      syncWebViewQuery.invalidate(bookmarkQueryKeys.all);
    },
  });
};

export { useBookmarkPostMutation, useBookmarkDeleteMutation };
