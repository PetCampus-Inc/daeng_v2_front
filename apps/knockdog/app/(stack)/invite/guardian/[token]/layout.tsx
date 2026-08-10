import type { ReactNode } from 'react';

import { GuardianInviteFlowProvider } from '@features/guardian-invite-flow';

export default function Layout({ children }: { children: ReactNode }) {
  return <GuardianInviteFlowProvider>{children}</GuardianInviteFlowProvider>;
}
