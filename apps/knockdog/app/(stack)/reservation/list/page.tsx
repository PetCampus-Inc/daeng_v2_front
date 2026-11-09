import { Suspense } from 'react';

import { GuardianReservationListPage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianReservationListPage />
    </Suspense>
  );
}
