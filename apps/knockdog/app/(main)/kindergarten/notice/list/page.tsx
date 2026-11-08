import { Suspense } from 'react';

import { GuardianDailyNoticeListPage } from '@views/guardian-daily-notice-list-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianDailyNoticeListPage />
    </Suspense>
  );
}
