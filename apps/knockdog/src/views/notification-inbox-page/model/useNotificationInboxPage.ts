'use client';

import { useCallback, useMemo } from 'react';

import { useNotificationReadMutation, useNotificationsInfiniteQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { NOTIFICATION_INBOX_PAGE_SIZE } from '@views/notification-inbox-page/config/notificationInboxConstants';
import { toNotificationInboxItem } from '@views/notification-inbox-page/lib/toNotificationInboxItem';

function useNotificationInboxPage() {
  const userId = useUserStore((state) => state.user?.userId);
  const query = useNotificationsInfiniteQuery({
    userId,
    size: NOTIFICATION_INBOX_PAGE_SIZE,
  });
  const { markRead, markAllRead } = useNotificationReadMutation({
    userId,
    size: NOTIFICATION_INBOX_PAGE_SIZE,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.notifications.map(toNotificationInboxItem)) ?? [],
    [query.data?.pages]
  );

  const hasUnreadFromServer = Boolean(query.data?.pages[0]?.hasUnread);
  const hasUnread =
    items.some((item) => !item.isRead) || (hasUnreadFromServer && Boolean(query.hasNextPage));

  const markItemAsRead = useCallback(
    (id: string) => {
      markRead.mutate(id);
    },
    [markRead]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllRead.mutateAsync();
  }, [markAllRead]);

  return {
    items,
    hasUnread,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    isPending: !userId || query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    markItemAsRead,
    markAllAsRead,
  };
}

export { useNotificationInboxPage };
