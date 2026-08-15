'use client';

import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';
import { NotificationInboxEmpty } from '@views/notification-inbox-page/ui/NotificationInboxEmpty';
import { Header } from '@widgets/Header';

function NotificationInboxPage() {
  const content = notificationInboxContent;

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 shrink-0'>
        <Header>
          <Header.BackButton />
          <Header.Title>{content.pageTitle}</Header.Title>
        </Header>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
        <NotificationInboxEmpty />
      </div>
    </div>
  );
}

export { NotificationInboxPage };
