'use client';

import { Suspense } from 'react';
import KindergartenMainPage from '@views/kindergarten-main-page';

export default function Home() {
  return (
    <Suspense>
      <div id='main' className='web:mb-(--bottom-bar-height) webview:mb-0 relative h-full w-full'>
        <KindergartenMainPage />
      </div>
    </Suspense>
  );
}
