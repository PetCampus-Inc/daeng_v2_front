'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import {
  isNotificationInboxEmptyMock,
  isNotificationInboxListMock,
  MOCK_NOTIFICATION_INBOX_ITEMS,
} from '@views/notification-inbox-page/config/notificationInboxMock';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { NotificationInboxEmpty } from '@views/notification-inbox-page/ui/NotificationInboxEmpty';
import { NotificationInboxList } from '@views/notification-inbox-page/ui/NotificationInboxList';
import { Header } from '@widgets/Header';

function sortBySentAtDesc(items: NotificationInboxItem[]) {
  return [...items].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

function NotificationInboxPage() {
  const content = notificationInboxContent;
  const searchParams = useSearchParams();
  const mockQuery = searchParams.get('mock');

  const isEmpty = isNotificationInboxEmptyMock(mockQuery);
  const isList = isNotificationInboxListMock(mockQuery);

  const [items, setItems] = useState(() => sortBySentAtDesc(MOCK_NOTIFICATION_INBOX_ITEMS));

  const visibleItems = useMemo(() => (isList && !isEmpty ? items : []), [isEmpty, isList, items]);
  const hasUnread = visibleItems.some((item) => !item.isRead);

  const handleMarkAllRead = () => {
    // TODO: 모두읽음 API + 확인 모달(M-03)
    setItems((prev) => prev.map((item) => (item.isRead ? item : { ...item, isRead: true })));
  };

  const handleItemClick = (item: NotificationInboxItem) => {
    // TODO: 타입별 딥링크 + 단건 읽음 처리 API
    if (item.isRead) return;
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)));
  };

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton />
          <Header.Title>{content.pageTitle}</Header.Title>
          {hasUnread ? (
            <Header.RightSection>
              <button
                type='button'
                onClick={handleMarkAllRead}
                className='label-semibold text-text-primary px-2 py-1'
              >
                {content.markAllReadLabel}
              </button>
            </Header.RightSection>
          ) : null}
        </Header>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
        {visibleItems.length === 0 ? (
          <NotificationInboxEmpty />
        ) : (
          <NotificationInboxList items={visibleItems} onItemClick={handleItemClick} />
        )}
      </div>
    </div>
  );
}

export { NotificationInboxPage };
