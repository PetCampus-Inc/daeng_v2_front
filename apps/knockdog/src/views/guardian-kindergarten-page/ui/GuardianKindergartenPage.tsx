'use client';

import { useGuardianKindergartenConnection } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenConnection';

import { GuardianKindergartenApprovedState } from './GuardianKindergartenApprovedState';
import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';
import { GuardianKindergartenHeader } from './GuardianKindergartenHeader';
import { GuardianKindergartenMockSwitcher } from './GuardianKindergartenMockSwitcher';
import { GuardianKindergartenPendingState } from './GuardianKindergartenPendingState';

export function GuardianKindergartenPage() {
  const { status, linkedKindergarten } = useGuardianKindergartenConnection();

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
