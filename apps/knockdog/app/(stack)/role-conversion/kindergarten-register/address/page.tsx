import { Suspense } from 'react';

import { KindergartenRegisterAddressPage } from '@views/role-conversion/kindergarten-register/ui/KindergartenRegisterAddressPage';

export default function Page() {
  return (
    <Suspense>
      <KindergartenRegisterAddressPage />
    </Suspense>
  );
}
