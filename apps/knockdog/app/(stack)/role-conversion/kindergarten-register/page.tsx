import { Suspense } from 'react';

import { KindergartenRegisterPage } from '@views/role-conversion/kindergarten-register';

export default function Page() {
  return (
    <Suspense>
      <KindergartenRegisterPage />
    </Suspense>
  );
}
