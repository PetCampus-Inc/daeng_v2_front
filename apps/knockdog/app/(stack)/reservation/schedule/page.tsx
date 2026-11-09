import { Suspense } from 'react';

import { GuardianReservationHoursPage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianReservationHoursPage />
    </Suspense>
  );
}
