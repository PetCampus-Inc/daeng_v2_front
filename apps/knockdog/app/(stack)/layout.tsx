'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@knockdog/ui/lib';
import { resolveStackSafeAreaTheme } from '@shared/constants/stackSafeAreaTheme';
import { SafeArea } from '@shared/ui/safe-area';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { backgroundClassName } = resolveStackSafeAreaTheme(pathname);

  return (
    <SafeArea className={cn('flex h-dvh flex-col', backgroundClassName)} edges={['top', 'bottom']}>
      {children}
    </SafeArea>
  );
}
