'use client';

import { Suspense, useLayoutEffect, useState } from 'react';
import KindergartenMainPage from '@views/kindergarten-main-page';
import { cn } from '@knockdog/ui/lib';
import { isNativeWebView } from '@shared/lib';

export default function Home() {
  const [isWebView, setIsWebView] = useState(false);

  useLayoutEffect(() => {
    setIsWebView(isNativeWebView());
  }, []);

  return (
    <Suspense>
      <div className={cn('relative h-full w-full', !isWebView && 'mb-(--bottom-bar-height)')}>
        <KindergartenMainPage />
      </div>
    </Suspense>
  );
}
