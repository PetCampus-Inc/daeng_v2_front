import { Suspense } from 'react';

import { GuardianReservationDetailPage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianReservationDetailPage />
    </Suspense>
  );
}
