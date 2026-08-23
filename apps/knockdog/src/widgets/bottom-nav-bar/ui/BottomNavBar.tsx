'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { GUARDIAN_NAV_ITEMS, OWNER_NAV_ITEMS } from '@widgets/bottom-nav-bar/config/navitem';
import { useShowOwnerBottomNav } from '@features/role-conversion';
import { useRequiredTermsConsentOverlayStore } from '@features/required-terms-consent';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { isNativeWebView } from '@shared/lib';

function isActiveNavItem(pathname: string, href: string) {
  if (href === '/' || href === '/owner') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function BottomNavBarLinks() {
  const pathname = usePathname();
  const showOwnerBottomNav = useShowOwnerBottomNav();
  const isTermsOverlayOpen = useRequiredTermsConsentOverlayStore((state) => state.isBlockingOverlayOpen);
  const navItems = showOwnerBottomNav ? OWNER_NAV_ITEMS : GUARDIAN_NAV_ITEMS;

  if (isTermsOverlayOpen) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-99'>
      <nav
        style={{ height: `${BOTTOM_BAR_HEIGHT}px` }}
        className='border-t-line-100 bg-bg-0 mx-auto flex w-full max-w-120 border-t px-3 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'
      >
        {navItems.map((item) => {
          const isActive = isActiveNavItem(pathname, item.href);
          const colorClassName = isActive ? 'text-fill-primary-500' : 'text-fill-secondary-500';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-y-0.5 ${colorClassName}`}
            >
              <div className='flex size-6 items-center justify-center'>
                <Icon icon={item.icon} className='size-6' />
              </div>
              <span className='text-[12px] leading-[16px] font-regular tracking-normal'>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function BottomNavBarContent() {
  if (isNativeWebView()) {
    return null;
  }

  return <BottomNavBarLinks />;
}

export const BottomNavBar = dynamic(() => Promise.resolve(BottomNavBarContent), {
  ssr: false,
});
