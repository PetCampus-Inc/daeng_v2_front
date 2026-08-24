import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Notification, NotificationListPage } from '../model/notification';
import { patchNotificationRead, patchNotificationsReadAll } from './notification';
import {
  NOTIFICATIONS_QUERY_KEY,
  notificationsQueryKey,
  type NotificationsCache,
} from './useNotificationsInfiniteQuery';
import { getHasUnreadNotification, notificationsUnreadQueryKey } from './useHasUnreadNotificationQuery';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

interface UseNotificationReadMutationOptions {
  userId?: string;
  size?: number;
}

interface NotificationReadMutationContext {
  queryKey: ReturnType<typeof notificationsQueryKey>;
  previous: NotificationsCache | undefined;
  unreadQueryKey?: ReturnType<typeof notificationsUnreadQueryKey>;
  previousUnread?: boolean;
}

function withUnreadFlag(pages: NotificationListPage[], hasUnreadOverride?: boolean) {
  const loadedHasUnread = pages.some((page) =>
    page.notifications.some((notification) => !notification.isRead)
  );
  const canLowerUnread = pages.at(-1)?.hasNext === false;
  const previousHasUnread = pages.some((page) => page.hasUnread);
  const hasUnread = hasUnreadOverride ?? (loadedHasUnread || (!canLowerUnread && previousHasUnread));

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
  mapNotification: (notification: Notification) => Notification,
  hasUnreadOverride?: boolean
): NotificationsCache | undefined {
  if (!cache) return cache;

  return {
    ...cache,
    pages: withUnreadFlag(
      cache.pages.map((page) => ({
        ...page,
        notifications: page.notifications.map(mapNotification),
      })),
      hasUnreadOverride
    ),
  };
}

function useNotificationReadMutation({ userId, size }: UseNotificationReadMutationOptions = {}) {
  const queryClient = useQueryClient();
  const queryKey = notificationsQueryKey(userId, size);
  const unreadQueryKey = notificationsUnreadQueryKey(userId);

  const refreshUnreadNotification = async () => {
    await queryClient
      .fetchQuery({ queryKey: unreadQueryKey, queryFn: getHasUnreadNotification, staleTime: 0 })
      .catch(() => undefined);
  };

  const syncUnreadNotification = async () => {
    if (!userId) return;

    await refreshUnreadNotification();
    syncWebViewQuery.refetch([NOTIFICATIONS_QUERY_KEY]);
  };

  const markRead = useMutation({
    mutationFn: patchNotificationRead,
    onMutate: async (notificationId): Promise<NotificationReadMutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: unreadQueryKey });
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
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      await syncUnreadNotification();
    },
  });

  const markAllRead = useMutation({
    mutationFn: patchNotificationsReadAll,
    onMutate: async (): Promise<NotificationReadMutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: unreadQueryKey });
      const previous = queryClient.getQueryData<NotificationsCache>(queryKey);
      const previousUnread = queryClient.getQueryData<boolean>(unreadQueryKey);
      const readAt = new Date().toISOString();
      queryClient.setQueryData(queryKey, (cache: NotificationsCache | undefined) =>
        updateNotificationsCache(cache, (notification) => markAllNotificationsRead(notification, readAt), false)
      );
      queryClient.setQueryData(unreadQueryKey, false);
      return { queryKey, previous, unreadQueryKey, previousUnread };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
      if (context?.unreadQueryKey) {
        if (context.previousUnread === undefined) {
          queryClient.removeQueries({ queryKey: context.unreadQueryKey, exact: true });
        } else {
          queryClient.setQueryData(context.unreadQueryKey, context.previousUnread);
        }
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      await syncUnreadNotification();
    },
  });

  return { markRead, markAllRead };
}

export { useNotificationReadMutation };
