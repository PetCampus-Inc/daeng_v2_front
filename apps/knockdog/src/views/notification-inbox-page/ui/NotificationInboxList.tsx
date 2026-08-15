'use client';

import type { NotificationInboxItem as NotificationInboxItemModel } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { NotificationInboxItem } from '@views/notification-inbox-page/ui/NotificationInboxItem';

interface NotificationInboxListProps {
  items: NotificationInboxItemModel[];
  onItemClick?: (item: NotificationInboxItemModel) => void;
}

function NotificationInboxList({ items, onItemClick }: NotificationInboxListProps) {
  return (
    <ul className='flex w-full flex-col'>
      {items.map((item) => (
        <li key={item.id}>
          <NotificationInboxItem item={item} onClick={onItemClick} />
        </li>
      ))}
    </ul>
  );
}

export { NotificationInboxList };
