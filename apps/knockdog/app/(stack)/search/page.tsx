'use client';

import { SearchPage } from '@views/search-page';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
