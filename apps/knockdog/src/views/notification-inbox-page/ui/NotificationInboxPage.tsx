'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { toast } from '@shared/ui/toast';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import {
  getMockNotificationInboxItems,
  isNotificationInboxEmptyMock,
  isNotificationInboxListMock,
  isNotificationMarkAllReadFailMock,
} from '@views/notification-inbox-page/config/notificationInboxMock';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { NotificationInboxEmpty } from '@views/notification-inbox-page/ui/NotificationInboxEmpty';
import { NotificationInboxList } from '@views/notification-inbox-page/ui/NotificationInboxList';
import { NotificationInboxMarkAllReadDialog } from '@views/notification-inbox-page/ui/NotificationInboxMarkAllReadDialog';
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
  const shouldFailMarkAllRead = isNotificationMarkAllReadFailMock(mockQuery);

  const [items, setItems] = useState(() =>
    sortBySentAtDesc(getMockNotificationInboxItems(mockQuery))
  );

  const visibleItems = useMemo(() => (isList && !isEmpty ? items : []), [isEmpty, isList, items]);
  const hasUnread = visibleItems.some((item) => !item.isRead);

  const markAllAsRead = useCallback(async () => {
    // TODO: 모두읽음 API
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (shouldFailMarkAllRead) {
      throw new Error('MARK_ALL_READ_FAIL');
    }

    setItems((prev) => prev.map((item) => (item.isRead ? item : { ...item, isRead: true })));
  }, [shouldFailMarkAllRead]);

  const handleMarkAllReadClick = () => {
    overlay.open(({ isOpen, close }) => (
      <NotificationInboxMarkAllReadDialog
        isOpen={isOpen}
        close={close}
        onConfirm={async () => {
          try {
            await markAllAsRead();
            toast(content.markAllReadSuccessToast);
          } catch {
            toast(content.markAllReadFailToast);
            throw new Error('MARK_ALL_READ_FAIL');
          }
        }}
      />
    ));
  };

  const handleItemClick = (item: NotificationInboxItem) => {
    // TODO: 타입별 딥링크 + 단건 읽음 처리 API
    if (!item.isRead) {
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)));
    }

    // M-05: 대상 페이지 접근 권한 없음 / 데이터 삭제
    if (item.isTargetUnavailable) {
      toast(content.pageNotFoundToast);
      return;
    }
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
                onClick={handleMarkAllReadClick}
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
