import { Suspense } from 'react';
import { TermsPage } from '@views/terms-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TermsPage />
    </Suspense>
  );
}
