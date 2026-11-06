import { Suspense } from 'react';

import { ReleasePermissionVerifyPage } from '@views/role-conversion/release-permission';

export default function Page() {
  return (
    <Suspense>
      <ReleasePermissionVerifyPage />
    </Suspense>
  );
}
