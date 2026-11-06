'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@knockdog/ui/lib';
import { resolveStackSafeAreaTheme } from '@shared/constants/stackSafeAreaTheme';
import { SafeArea } from '@shared/ui/safe-area';

const SAFE_AREA_INSET_TOP = 'max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px))';
const SAFE_AREA_INSET_BOTTOM = 'max(var(--safe-area-inset-bottom, 0px), env(safe-area-inset-bottom, 0px))';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { topBackgroundClassName, bottomBackgroundClassName } = resolveStackSafeAreaTheme(pathname);

  return (
    <SafeArea className='relative flex h-dvh flex-col' edges={['top', 'bottom']}>
      {topBackgroundClassName ? (
        <div
          aria-hidden
          className={cn('pointer-events-none absolute inset-x-0 top-0', topBackgroundClassName)}
          style={{ height: SAFE_AREA_INSET_TOP }}
        />
      ) : null}
      {children}
      {bottomBackgroundClassName ? (
        <div
          aria-hidden
          className={cn('pointer-events-none absolute inset-x-0 bottom-0', bottomBackgroundClassName)}
          style={{ height: SAFE_AREA_INSET_BOTTOM }}
        />
      ) : null}
    </SafeArea>
  );
}
