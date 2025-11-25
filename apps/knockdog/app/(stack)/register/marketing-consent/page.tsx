import { MarketingConsentPage } from '@views/register/marketing-consent';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <MarketingConsentPage />
    </Suspense>
  );
}
