import { type ReactNode } from 'react';

import { OwnerAccessGuard } from '@features/role-conversion/ui/OwnerAccessGuard';

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: OwnerLayoutProps) {
  return <OwnerAccessGuard>{children}</OwnerAccessGuard>;
}
