'use client';

import { useState } from 'react';

import { overlay } from 'overlay-kit';

import { Tabs, TabsList, TabsTrigger } from '@knockdog/ui';
import type { NotificationAudience } from '@entities/notification';
import { useMypageRoleView, useOwnerRole } from '@features/role-conversion';
import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { PageError } from '@shared/ui/page-error';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';
import { trackNotificationInboxClick } from '@shared/lib/analytics';
import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { resolveNotificationGaType } from '@views/notification-inbox-page/lib/resolveNotificationGaType';
import { useNotificationInboxDeepLink } from '@views/notification-inbox-page/model/useNotificationInboxDeepLink';
import { useNotificationInboxPage } from '@views/notification-inbox-page/model/useNotificationInboxPage';
import { NotificationInboxEmpty } from '@views/notification-inbox-page/ui/NotificationInboxEmpty';
import { NotificationInboxList } from '@views/notification-inbox-page/ui/NotificationInboxList';
import { Header } from '@widgets/Header';

function NotificationInboxPage() {
  const content = notificationInboxContent;
  const { isOwner, isResolved: isOwnerRoleResolved } = useOwnerRole();
  const { isOwnerView } = useMypageRoleView();
  const [selectedTab, setSelectedTab] = useState<NotificationAudience | null>(null);
  const activeTab: NotificationAudience =
    selectedTab === 'OWNER' && !isOwner
      ? 'GUARDIAN'
      : (selectedTab ?? (isOwnerView && isOwner ? 'OWNER' : 'GUARDIAN'));
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
  } = useNotificationInboxPage(activeTab, selectedTab !== null || isOwnerRoleResolved);
  const { openNotification } = useNotificationInboxDeepLink();

  const handleRetry = () => {
    void refetch();
  };

  const confirmMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast(content.markAllReadSuccessToast);
    } catch {
      toast(content.markAllReadFailToast);
    }
  };

  /** 모두 읽음 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다. */
  const handleMarkAllReadClick = async () => {
    const result = await openConfirmDialog(content.markAllReadDialog);
    if (result.status === 'resolved') {
      if (result.action === 'confirm') void confirmMarkAllRead();
      return;
    }
    if (result.status === 'pending') return;

    overlay.open(({ isOpen, close }) => (
      <ConfirmDialog
        {...content.markAllReadDialog}
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          close();
          void confirmMarkAllRead();
        }}
      />
    ));
  };

  const handleItemClick = (item: NotificationInboxItem) => {
    trackNotificationInboxClick({
      notification_id: item.id,
      notification_type: resolveNotificationGaType(item.type) ?? undefined,
    });

    if (!item.isRead) markItemAsRead(item.id);
    openNotification(item);
  };

  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col overflow-hidden'>
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

        {isOwner ? (
          <Tabs value={activeTab} onValueChange={(value) => setSelectedTab(value as NotificationAudience)}>
            <TabsList>
              <TabsTrigger value='GUARDIAN'>보호자</TabsTrigger>
              <TabsTrigger value='OWNER'>원장</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
      </div>

      {isError ? (
        <PageError layout='inline' className='bg-bg-50' isRetrying={isFetching} onRetry={handleRetry} />
      ) : isPending ? (
        <DelayedLoadingSpinner isLoading={isPending} layout='content' className='bg-bg-50' />
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto'>
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
