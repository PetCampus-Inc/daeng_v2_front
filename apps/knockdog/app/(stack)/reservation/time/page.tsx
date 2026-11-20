import { Suspense } from 'react';

import { GuardianReservationTimePage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianReservationTimePage />
    </Suspense>
  );
}
