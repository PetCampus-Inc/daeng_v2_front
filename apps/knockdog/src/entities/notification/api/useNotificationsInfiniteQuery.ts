import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { toNotificationListPage, type NotificationListPage } from '../model/notification';
import { getNotifications, type NotificationAudience } from './notification';

const NOTIFICATIONS_QUERY_KEY = 'notifications';

const notificationsQueryKey = (userId?: string, audience?: NotificationAudience, size?: number) =>
  [NOTIFICATIONS_QUERY_KEY, userId, audience, size] as const;

type NotificationsCache = InfiniteData<NotificationListPage, string | undefined>;

interface UseNotificationsInfiniteQueryOptions {
  userId?: string;
  audience: NotificationAudience;
  size?: number;
  enabled?: boolean;
}

function useNotificationsInfiniteQuery({
  userId,
  audience,
  size = 30,
  enabled = true,
}: UseNotificationsInfiniteQueryOptions) {
  return useInfiniteQuery({
    queryKey: notificationsQueryKey(userId, audience, size),
    queryFn: async ({ pageParam }) => {
      const response = await getNotifications({
        audience,
        cursor: pageParam,
        size,
      });

      return toNotificationListPage(response.data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: enabled && Boolean(userId),
    staleTime: 0,
  });
}

export { NOTIFICATIONS_QUERY_KEY, notificationsQueryKey, useNotificationsInfiniteQuery };
export type { NotificationsCache };
