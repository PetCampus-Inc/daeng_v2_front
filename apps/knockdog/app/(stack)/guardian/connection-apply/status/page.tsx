import { Suspense } from 'react';

import { GuardianConnectionApplyStatusPage } from '@views/guardian-connection-apply-status-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianConnectionApplyStatusPage />
    </Suspense>
  );
}
