'use client';

import { SafeArea } from '@shared/ui/safe-area';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea className='flex h-dvh flex-col' edges={['top']}>
      {children}
    </SafeArea>
  );
}
