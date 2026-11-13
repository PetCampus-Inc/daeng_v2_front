import { Suspense } from 'react';

import { GuardianDiaryDetailPage } from '@views/guardian-diary-detail-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianDiaryDetailPage />
    </Suspense>
  );
}
