'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import { NOTIFICATION_INBOX_PAGE_SIZE } from '@views/notification-inbox-page/config/notificationInboxConstants';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import {
  getMockNotificationInboxItems,
  isNotificationInboxEmptyMock,
  isNotificationInboxErrorMock,
  isNotificationMarkAllReadFailMock,
} from '@views/notification-inbox-page/config/notificationInboxMock';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import {
  filterNotificationInboxByRetention,
  sortNotificationInboxBySentAtDesc,
} from '@views/notification-inbox-page/lib/prepareNotificationInboxList';
import { NotificationInboxEmpty } from '@views/notification-inbox-page/ui/NotificationInboxEmpty';
import { NotificationInboxList } from '@views/notification-inbox-page/ui/NotificationInboxList';
import { NotificationInboxMarkAllReadDialog } from '@views/notification-inbox-page/ui/NotificationInboxMarkAllReadDialog';
import { Header } from '@widgets/Header';

function prepareInboxItems(items: NotificationInboxItem[]) {
  return sortNotificationInboxBySentAtDesc(filterNotificationInboxByRetention(items));
}

function NotificationInboxPage() {
  const content = notificationInboxContent;
  const searchParams = useSearchParams();
  const mockQuery = searchParams.get('mock');

  const isEmpty = isNotificationInboxEmptyMock(mockQuery);
  const shouldFailMarkAllRead = isNotificationMarkAllReadFailMock(mockQuery);

  const [hasLoadError, setHasLoadError] = useState(() => isNotificationInboxErrorMock(mockQuery));
  const [isRetrying, setIsRetrying] = useState(false);
  const [sourceItems, setSourceItems] = useState(() =>
    prepareInboxItems(getMockNotificationInboxItems(mockQuery))
  );
  const [loadedCount, setLoadedCount] = useState(NOTIFICATION_INBOX_PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const preparedItems = useMemo(() => {
    if (hasLoadError || isEmpty) return [];
    return sourceItems;
  }, [hasLoadError, isEmpty, sourceItems]);
  const visibleItems = useMemo(
    () => preparedItems.slice(0, loadedCount),
    [loadedCount, preparedItems]
  );
  const hasNextPage = visibleItems.length < preparedItems.length;
  const hasUnread = preparedItems.some((item) => !item.isRead);

  const fetchNextPage = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;

    setIsFetchingNextPage(true);
    // TODO: 알림 리스트 페이지네이션 API (pageSize=30)
    window.setTimeout(() => {
      setLoadedCount((prev) => prev + NOTIFICATION_INBOX_PAGE_SIZE);
      setIsFetchingNextPage(false);
    }, 300);
  }, [hasNextPage, isFetchingNextPage]);

  const handleRetry = () => {
    // TODO: 알림 리스트 최초 조회 API 재시도
    setIsRetrying(true);
    window.setTimeout(() => {
      setSourceItems(prepareInboxItems(getMockNotificationInboxItems(null)));
      setLoadedCount(NOTIFICATION_INBOX_PAGE_SIZE);
      setHasLoadError(false);
      setIsRetrying(false);
    }, 300);
  };

  const markAllAsRead = useCallback(async () => {
    // TODO: 모두읽음 API
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (shouldFailMarkAllRead) {
      throw new Error('MARK_ALL_READ_FAIL');
    }

    setSourceItems((prev) => prev.map((item) => (item.isRead ? item : { ...item, isRead: true })));
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
      setSourceItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row))
      );
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
          {!hasLoadError && hasUnread ? (
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

      {hasLoadError ? (
        <PageError layout='inline' className='bg-bg-50' isRetrying={isRetrying} onRetry={handleRetry} />
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
          {visibleItems.length === 0 ? (
            <NotificationInboxEmpty />
          ) : (
            <NotificationInboxList
              items={visibleItems}
              onItemClick={handleItemClick}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export { NotificationInboxPage };
