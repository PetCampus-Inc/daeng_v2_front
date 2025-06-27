'use client';

import { OverlayProvider as OverClientProvider } from 'overlay-kit';

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  return <OverClientProvider>{children}</OverClientProvider>;
}
