import type { ReactNode } from 'react';

import { OwnerAccessGuard } from '@features/role-conversion/ui/OwnerAccessGuard';

interface PassTemplatesLayoutProps {
  children: ReactNode;
}

export default function PassTemplatesLayout({ children }: PassTemplatesLayoutProps) {
  return <OwnerAccessGuard>{children}</OwnerAccessGuard>;
}
