'use client';

import { Suspense, useEffect, useState } from 'react';

import { NaverMapCore, NaverMapCoreProps } from './NaverMapCore';

interface NaverMapProps extends NaverMapCoreProps {
  children?: React.ReactNode;
  className?: string;
}

export function NaverMap({
  className,
  children,
  ...mapOptions
}: NaverMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  return (
    <div className={className}>
      {isMounted && (
        // useNaverMaps suspend 처리 때문에 Suspense 사용
        <Suspense fallback={null}>
          <NaverMapCore {...mapOptions}>{children}</NaverMapCore>
        </Suspense>
      )}
    </div>
  );
}
