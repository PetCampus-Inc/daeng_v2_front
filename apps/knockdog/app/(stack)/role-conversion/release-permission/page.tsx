import { Suspense } from 'react';

import { ReleasePermissionPage } from '@views/role-conversion/release-permission';

export default function Page() {
  return (
    <Suspense>
      <ReleasePermissionPage />
    </Suspense>
  );
}
