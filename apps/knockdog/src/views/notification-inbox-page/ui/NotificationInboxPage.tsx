'use client';

import { overlay } from 'overlay-kit';

import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { useNotificationInboxDeepLink } from '@views/notification-inbox-page/model/useNotificationInboxDeepLink';
import { useNotificationInboxPage } from '@views/notification-inbox-page/model/useNotificationInboxPage';
import { NotificationInboxEmpty } from '@views/notification-inbox-page/ui/NotificationInboxEmpty';
import { NotificationInboxList } from '@views/notification-inbox-page/ui/NotificationInboxList';
import { NotificationInboxMarkAllReadDialog } from '@views/notification-inbox-page/ui/NotificationInboxMarkAllReadDialog';
import { Header } from '@widgets/Header';

function NotificationInboxPage() {
  const content = notificationInboxContent;
  const {
    items,
    hasUnread,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isPending,
    isFetching,
    isError,
    refetch,
    markItemAsRead,
    markAllAsRead,
  } = useNotificationInboxPage();
  const { openNotification } = useNotificationInboxDeepLink();

  const handleRetry = () => {
    void refetch();
  };

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
    if (!item.isRead) markItemAsRead(item.id);
    openNotification(item);
  };

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton />
          <Header.Title>{content.pageTitle}</Header.Title>
          {!isError && !isPending && hasUnread ? (
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

      {isError ? (
        <PageError layout='inline' className='bg-bg-50' isRetrying={isFetching} onRetry={handleRetry} />
      ) : isPending ? (
        <div className='min-h-0 flex-1 bg-bg-50' />
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
          {items.length === 0 ? (
            <NotificationInboxEmpty />
          ) : (
            <NotificationInboxList
              items={items}
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
