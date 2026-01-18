'use client';

import { Suspense } from 'react';
import KindergartenMainPage from '@views/kindergarten-main-page';
import { cn } from '@knockdog/ui/lib';
import { isNativeWebView } from '@shared/lib';

export default function Home() {
  return (
    <Suspense>
      <div id='main' className={cn('relative h-full w-full', !isNativeWebView() && 'mb-(--bottom-bar-height)')}>
        <KindergartenMainPage />
      </div>
    </Suspense>
  );
}
