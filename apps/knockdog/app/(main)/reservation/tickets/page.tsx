import { Suspense } from 'react';

import { GuardianTicketManagePage } from '@views/guardian-reservation-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianTicketManagePage />
    </Suspense>
  );
}
