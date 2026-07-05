'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icon } from '@knockdog/ui';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { isNativeWebView } from '@shared/lib';
import { useIsOwnerVerified } from '@features/role-conversion';
import { GUARDIAN_NAV_ITEMS, OWNER_NAV_ITEMS } from '@widgets/bottom-nav-bar/config/navitem';

function BottomNavBarContent() {
  const isOwnerVerified = useIsOwnerVerified();
  const navItems = isOwnerVerified ? OWNER_NAV_ITEMS : GUARDIAN_NAV_ITEMS;

  if (isNativeWebView()) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-99'>
      <nav
        style={{ height: `${BOTTOM_BAR_HEIGHT}px` }}
        className='border-t-line-100 bg-bg-0 mx-auto flex w-full max-w-120 border-t px-4 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'
      >
        {navItems.map((item) => (
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

export const BottomNavBar = dynamic(() => Promise.resolve(BottomNavBarContent), {
  ssr: false,
});
