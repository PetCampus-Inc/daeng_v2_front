import { Suspense } from 'react';

import { GuardianDiaryGeneratePage } from '@views/guardian-diary-generate-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianDiaryGeneratePage />
    </Suspense>
  );
}
