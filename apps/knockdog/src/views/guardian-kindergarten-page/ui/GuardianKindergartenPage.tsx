'use client';

import { GuardianKindergartenHeader } from './GuardianKindergartenHeader';
import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';

export function GuardianKindergartenPage() {
  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <GuardianKindergartenHeader />

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px]'>
        <GuardianKindergartenEmptyState />
      </div>
    </div>
  );
}
