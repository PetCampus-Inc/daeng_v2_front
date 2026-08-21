import { useQuery } from '@tanstack/react-query';

import { toNotificationListPage } from '../model/notification';
import { getNotifications } from './notification';
import { NOTIFICATIONS_QUERY_KEY } from './useNotificationsInfiniteQuery';

/** notificationsQueryKey(목록 조회)와 접두사를 공유해, 읽음 처리 mutation의 invalidateQueries(NOTIFICATIONS_QUERY_KEY)에 함께 걸리도록 함 */
const notificationsUnreadQueryKey = (userId?: string) =>
  [NOTIFICATIONS_QUERY_KEY, 'unread', userId] as const;

interface UseHasUnreadNotificationQueryOptions {
  userId?: string;
  enabled?: boolean;
}

/** 헤더 알림 아이콘 배지용 — 목록 상세 없이 안읽음 여부만 필요할 때 size 최소값(1)으로 조회 */
function useHasUnreadNotificationQuery({ userId, enabled = true }: UseHasUnreadNotificationQueryOptions = {}) {
  return useQuery({
    queryKey: notificationsUnreadQueryKey(userId),
    queryFn: async () => {
      const response = await getNotifications({ size: 1 });
      return toNotificationListPage(response.data).hasUnread;
    },
    enabled: enabled && Boolean(userId),
    staleTime: 60_000,
  });
}

export { notificationsUnreadQueryKey, useHasUnreadNotificationQuery };
