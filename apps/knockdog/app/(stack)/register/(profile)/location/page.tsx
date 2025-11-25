import { LocationRegisterPage } from '@views/register/location';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <LocationRegisterPage />
    </Suspense>
  );
}
