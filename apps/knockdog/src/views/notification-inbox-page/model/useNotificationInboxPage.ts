'use client';

import { useCallback, useMemo, useState } from 'react';

import { useNotificationsInfiniteQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { NOTIFICATION_INBOX_PAGE_SIZE } from '@views/notification-inbox-page/config/notificationInboxConstants';
import { toNotificationInboxItem } from '@views/notification-inbox-page/lib/toNotificationInboxItem';

function useNotificationInboxPage() {
  const userId = useUserStore((state) => state.user?.userId);
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(() => new Set());
  const [isMarkedAllRead, setIsMarkedAllRead] = useState(false);

  const query = useNotificationsInfiniteQuery({
    userId,
    size: NOTIFICATION_INBOX_PAGE_SIZE,
  });

  const items = useMemo(() => {
    const mapped = query.data?.pages.flatMap((page) => page.notifications.map(toNotificationInboxItem)) ?? [];

    if (!isMarkedAllRead && locallyReadIds.size === 0) return mapped;

    return mapped.map((item) =>
      isMarkedAllRead || locallyReadIds.has(item.id) ? { ...item, isRead: true } : item
    );
  }, [isMarkedAllRead, locallyReadIds, query.data?.pages]);

  const hasUnreadFromServer = Boolean(query.data?.pages[0]?.hasUnread);
  const hasUnread =
    !isMarkedAllRead &&
    (items.some((item) => !item.isRead) || (hasUnreadFromServer && Boolean(query.hasNextPage)));

  const markItemAsRead = useCallback((id: string) => {
    setLocallyReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setIsMarkedAllRead(true);
  }, []);

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
