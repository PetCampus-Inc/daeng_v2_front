'use client';

import { useCallback, useEffect, useState } from 'react';

import { useGuardianKindergartenConnection } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenConnection';
import { useTabNavigation } from '@shared/lib/bridge';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';

import { GuardianKindergartenApprovedState } from './GuardianKindergartenApprovedState';
import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';
import { GuardianKindergartenHeader } from './GuardianKindergartenHeader';
import { GuardianKindergartenMockSwitcher } from './GuardianKindergartenMockSwitcher';
import { GuardianKindergartenPendingState } from './GuardianKindergartenPendingState';

export function GuardianKindergartenPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { navigateToTab } = useTabNavigation();

  const handleAuthError = useCallback(
    async (_error: Error) => {
      await navigateToTab('/');
    },
    [navigateToTab]
  );

  const hasAuth = useRequireAuth(handleAuthError);
  const { status, linkedKindergarten } = useGuardianKindergartenConnection();

  useEffect(() => {
    setIsMounted(true);
    setIsLoggedIn(hasAuth);
  }, [hasAuth]);

  if (!isMounted || !isLoggedIn) return null;

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <GuardianKindergartenMockSwitcher />
      <GuardianKindergartenHeader status={status} />

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px]'>
        {status === 'approved' && linkedKindergarten ? (
          <GuardianKindergartenApprovedState kindergarten={linkedKindergarten} />
        ) : status === 'pending' && linkedKindergarten ? (
          <GuardianKindergartenPendingState kindergarten={linkedKindergarten} />
        ) : (
          <GuardianKindergartenEmptyState />
        )}
      </div>
    </div>
  );
}
