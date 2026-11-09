import { Suspense } from 'react';

import { GuardianTicketDetailPage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianTicketDetailPage />
    </Suspense>
  );
}
