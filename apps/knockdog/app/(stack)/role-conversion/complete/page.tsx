import { Suspense } from 'react';

import { RoleConversionResultPage } from '@views/role-conversion/complete';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoleConversionResultPage />
    </Suspense>
  );
}
