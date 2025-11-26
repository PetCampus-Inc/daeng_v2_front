import { PetRelationshipPage } from '@views/register/pet';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <PetRelationshipPage />
    </Suspense>
  );
}
