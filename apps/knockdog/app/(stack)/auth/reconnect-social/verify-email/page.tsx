import { VerifyEmailPage } from '@views/verify-email';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}
