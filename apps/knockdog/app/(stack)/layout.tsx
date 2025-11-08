'use client';

import { useSafeAreaInsets } from '@shared/lib';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <div className='flex h-dvh flex-col' style={{ paddingTop: insets.top }}>
      {children}
    </div>
  );
}
