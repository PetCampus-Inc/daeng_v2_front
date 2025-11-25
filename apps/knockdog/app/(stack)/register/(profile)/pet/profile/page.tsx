import { PetProfilePage } from '@views/register/pet';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <PetProfilePage />
    </Suspense>
  );
}
