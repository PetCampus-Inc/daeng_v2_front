'use client';

import { useCallback } from 'react';

import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import type { NotificationInboxItem as NotificationInboxItemModel } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { NotificationInboxItem } from '@views/notification-inbox-page/ui/NotificationInboxItem';

interface NotificationInboxListProps {
  items: NotificationInboxItemModel[];
  onItemClick?: (item: NotificationInboxItemModel) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

function NotificationInboxList({
  items,
  onItemClick,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: NotificationInboxListProps) {
  const handleFetchNextPage = useCallback(() => {
    fetchNextPage?.();
  }, [fetchNextPage]);

  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
  });

  return (
    <div className='flex w-full flex-col'>
      <ul className='flex w-full flex-col'>
        {items.map((item) => (
          <li key={item.id}>
            <NotificationInboxItem item={item} onClick={onItemClick} />
          </li>
        ))}
      </ul>

      {hasNextPage ? (
        <div ref={lastElementCallback} aria-hidden='true' className='h-4' />
      ) : (
        <p className='label-medium text-text-caption flex items-center justify-center p-4 text-center'>
          {notificationInboxContent.listFooterCaption}
        </p>
      )}
    </div>
  );
}

export { NotificationInboxList };
