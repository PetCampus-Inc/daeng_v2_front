'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@knockdog/ui';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { isNativeWebView } from '@shared/lib';
import { NAV_ITEMS } from '../config/navitem';

export function BottomNavBar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // hydration 완료 후 네이티브 웹뷰 체크
  if (isMounted && isNativeWebView()) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-99'>
      <nav
        style={{ height: `${BOTTOM_BAR_HEIGHT}px` }}
        className='border-t-line-100 bg-bg-0 mx-auto flex w-full max-w-screen-sm border-t px-4 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'
      >
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className='flex flex-1 flex-col items-center justify-center gap-y-1'>
            <div className='size-6'>
              <Icon icon={item.icon} />
            </div>
            <span className='caption1-extrabold text-fill-secondary-700'>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
