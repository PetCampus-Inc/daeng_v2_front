import { Suspense } from 'react';

import { NotificationInboxPage } from '@views/notification-inbox-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NotificationInboxPage />
    </Suspense>
  );
}
