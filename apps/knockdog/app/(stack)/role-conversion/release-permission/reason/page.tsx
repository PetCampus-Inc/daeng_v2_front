import { Suspense } from 'react';

import { ReleasePermissionReasonPage } from '@views/role-conversion/release-permission';

export default function Page() {
  return (
    <Suspense>
      <ReleasePermissionReasonPage />
    </Suspense>
  );
}
