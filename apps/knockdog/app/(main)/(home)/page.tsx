'use client';

import { Suspense } from 'react';
import KindergartenMainPage from '@views/kindergarten-main-page';

export default function Home() {
  return (
    <Suspense>
      <KindergartenMainPage />
    </Suspense>
  );
}
