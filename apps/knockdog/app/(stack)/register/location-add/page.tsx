import { LocationAddPage } from '@views/register/location';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <LocationAddPage />
    </Suspense>
  );
}
