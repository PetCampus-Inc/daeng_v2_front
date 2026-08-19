import { Suspense } from 'react';
import { GuardianKindergartenPage } from '@views/guardian-kindergarten-page';

export default function Page() {
  return (
    <Suspense fallback={<main className='bg-bg-0 min-h-dvh p-4' />}>
      <GuardianKindergartenPage />
    </Suspense>
  );
}
