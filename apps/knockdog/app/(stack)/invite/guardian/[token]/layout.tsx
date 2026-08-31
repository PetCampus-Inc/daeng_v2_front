import type { Metadata } from 'next';
import type { ReactNode, Suspense } from 'react';

import { InviteEntrySourceSync } from '@shared/lib/analytics/InviteEntrySourceSync';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function GuardianInviteTokenLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Suspense fallback={null}>
        <InviteEntrySourceSync />
      </Suspense>
      {children}
    </>
  );
}
