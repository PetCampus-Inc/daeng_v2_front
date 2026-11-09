import { Suspense } from 'react';

import { ReservationConfirmPage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReservationConfirmPage />
    </Suspense>
  );
}
