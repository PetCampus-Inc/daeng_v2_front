import { Suspense } from 'react';

import { GuardianDailyNoticeDetailPage } from '@views/guardian-daily-notice-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianDailyNoticeDetailPage />
    </Suspense>
  );
}
