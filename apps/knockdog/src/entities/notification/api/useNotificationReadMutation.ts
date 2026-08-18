import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Notification, NotificationListPage } from '../model/notification';
import { patchNotificationRead, patchNotificationsReadAll } from './notification';
import {
  NOTIFICATIONS_QUERY_KEY,
  notificationsQueryKey,
  type NotificationsCache,
} from './useNotificationsInfiniteQuery';

interface UseNotificationReadMutationOptions {
  userId?: string;
  size?: number;
}

interface NotificationReadMutationContext {
  queryKey: ReturnType<typeof notificationsQueryKey>;
  previous: NotificationsCache | undefined;
}

function withUnreadFlag(pages: NotificationListPage[]): NotificationListPage[] {
  const hasUnread = pages.some((page) => page.notifications.some((notification) => !notification.isRead));

  return pages.map((page) => ({ ...page, hasUnread }));
}

function markNotificationRead(
  notification: Notification,
  notificationId: string,
  readAt: string
): Notification {
  if (notification.id !== notificationId || notification.isRead) return notification;
  return { ...notification, isRead: true, readAt };
}

function markAllNotificationsRead(notification: Notification, readAt: string): Notification {
  if (notification.isRead) return notification;
  return { ...notification, isRead: true, readAt };
}

function updateNotificationsCache(
  cache: NotificationsCache | undefined,
  mapNotification: (notification: Notification) => Notification
): NotificationsCache | undefined {
  if (!cache) return cache;

  return {
    ...cache,
    pages: withUnreadFlag(
      cache.pages.map((page) => ({
        ...page,
        notifications: page.notifications.map(mapNotification),
      }))
    ),
  };
}

function useNotificationReadMutation({ userId, size }: UseNotificationReadMutationOptions = {}) {
  const queryClient = useQueryClient();
  const queryKey = notificationsQueryKey(userId, size);

  const markRead = useMutation({
    mutationFn: patchNotificationRead,
    onMutate: async (notificationId): Promise<NotificationReadMutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationsCache>(queryKey);
      const readAt = new Date().toISOString();
      queryClient.setQueryData(queryKey, (cache: NotificationsCache | undefined) =>
        updateNotificationsCache(cache, (notification) => markNotificationRead(notification, notificationId, readAt))
      );
      return { queryKey, previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: patchNotificationsReadAll,
    onMutate: async (): Promise<NotificationReadMutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationsCache>(queryKey);
      const readAt = new Date().toISOString();
      queryClient.setQueryData(queryKey, (cache: NotificationsCache | undefined) =>
        updateNotificationsCache(cache, (notification) => markAllNotificationsRead(notification, readAt))
      );
      return { queryKey, previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });

  return { markRead, markAllRead };
}

export { useNotificationReadMutation };
