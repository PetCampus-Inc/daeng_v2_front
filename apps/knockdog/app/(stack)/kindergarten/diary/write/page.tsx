import { Suspense } from 'react';

import { GuardianDiaryWritePage } from '@views/guardian-diary-write-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianDiaryWritePage />
    </Suspense>
  );
}
