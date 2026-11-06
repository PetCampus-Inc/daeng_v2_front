import { Suspense } from 'react';

import { GuardianInviteResultPage } from '@views/guardian-invite/complete';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianInviteResultPage />
    </Suspense>
  );
}
