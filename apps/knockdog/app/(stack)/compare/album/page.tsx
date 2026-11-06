import { Suspense } from 'react';

import { GuardianAlbumPage } from '@views/guardian-album-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuardianAlbumPage />
    </Suspense>
  );
}
