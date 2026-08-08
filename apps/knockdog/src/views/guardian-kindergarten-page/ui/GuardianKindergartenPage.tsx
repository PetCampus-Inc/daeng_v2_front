'use client';

import { useCallback, useEffect, useState } from 'react';

import { useGuardianAttendanceDay } from '@views/guardian-kindergarten-page/model/useGuardianAttendanceDay';
import { useGuardianKindergartenConnection } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenConnection';
import { useTabNavigation } from '@shared/lib/bridge';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';

import { GuardianKindergartenApprovedState } from './GuardianKindergartenApprovedState';
import { GuardianKindergartenAttendingState } from './GuardianKindergartenAttendingState';
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
  const { isAttending, checkInAt, hasUnreadAlarm, hasDailyNotice, dailyNotice, albumPhotos } =
    useGuardianAttendanceDay();

  useEffect(() => {
    setIsMounted(true);
    setIsLoggedIn(hasAuth);
  }, [hasAuth]);

  if (!isMounted || !isLoggedIn) return null;

  const showAttending = status === 'approved' && isAttending && checkInAt && linkedKindergarten;

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <GuardianKindergartenMockSwitcher />
      <GuardianKindergartenHeader
        status={status}
        isAttending={Boolean(showAttending)}
        checkInAt={checkInAt}
        hasUnreadAlarm={Boolean(showAttending && hasUnreadAlarm)}
      />

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px]'>
        {showAttending ? (
          <GuardianKindergartenAttendingState
            kindergarten={linkedKindergarten}
            checkInAt={checkInAt}
            hasDailyNotice={hasDailyNotice}
            dailyNotice={dailyNotice}
            albumPhotos={albumPhotos}
          />
        ) : status === 'approved' && linkedKindergarten ? (
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
