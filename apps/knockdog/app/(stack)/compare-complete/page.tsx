import { CompareCompletePage } from '@views/compare-complete-page';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <CompareCompletePage />
    </Suspense>
  );
}
