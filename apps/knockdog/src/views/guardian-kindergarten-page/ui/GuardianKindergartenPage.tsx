'use client';

import { useCallback, useEffect, useState } from 'react';

import { useGuardianAttendanceDay } from '@views/guardian-kindergarten-page/model/useGuardianAttendanceDay';
import { useGuardianKindergartenConnection } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenConnection';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useTabNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';

import { GuardianKindergartenApprovedState } from './GuardianKindergartenApprovedState';
import { GuardianKindergartenAttendingState } from './GuardianKindergartenAttendingState';
import { GuardianKindergartenDisconnectedState } from './GuardianKindergartenDisconnectedState';
import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';
import { GuardianKindergartenHeader } from './GuardianKindergartenHeader';
import { GuardianKindergartenMockSwitcher } from './GuardianKindergartenMockSwitcher';
import { GuardianKindergartenNoPetState } from './GuardianKindergartenNoPetState';
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
  const {
    hasNoPet,
    isPetsReady,
    isPetsError,
    isPetsFetching,
    refetchPets,
  } = useGuardianSelectedPet();
  const { status, linkedKindergarten } = useGuardianKindergartenConnection();
  const {
    isAttending,
    isDismissed,
    checkInAt,
    checkOutAt,
    hasUnreadAlarm,
    hasDailyNotice,
    dailyNotice,
    albumPhotos,
    attendanceRecordDateKeys,
  } = useGuardianAttendanceDay();

  useEffect(() => {
    setIsMounted(true);
    setIsLoggedIn(hasAuth);
  }, [hasAuth]);

  if (!isMounted || !isLoggedIn || !isPetsReady) return null;

  if (isPetsError) {
    return <PageError isRetrying={isPetsFetching} onRetry={() => void refetchPets()} />;
  }

  const showDayState =
    !hasNoPet &&
    status === 'approved' &&
    linkedKindergarten &&
    checkInAt &&
    (isAttending || isDismissed);
  const showDisconnected = !hasNoPet && status === 'disconnected' && linkedKindergarten;

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
        isAttending={Boolean(showDayState && isAttending)}
        isDismissed={Boolean(showDayState && isDismissed)}
        checkInAt={checkInAt}
        checkOutAt={checkOutAt}
        hasUnreadAlarm={Boolean(showDayState && hasUnreadAlarm)}
        hasNoPet={hasNoPet}
      />

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px]'>
        {hasNoPet ? (
          <GuardianKindergartenNoPetState />
        ) : showDayState ? (
          <GuardianKindergartenAttendingState
            kindergarten={linkedKindergarten}
            checkInAt={checkInAt}
            checkOutAt={checkOutAt}
            hasDailyNotice={hasDailyNotice}
            dailyNotice={dailyNotice}
            albumPhotos={albumPhotos}
            attendanceRecordDateKeys={attendanceRecordDateKeys}
          />
        ) : showDisconnected ? (
          <GuardianKindergartenDisconnectedState kindergarten={linkedKindergarten} />
        ) : status === 'approved' && linkedKindergarten ? (
          <GuardianKindergartenApprovedState
            kindergarten={linkedKindergarten}
            attendanceRecordDateKeys={attendanceRecordDateKeys}
          />
        ) : status === 'pending' && linkedKindergarten ? (
          <GuardianKindergartenPendingState kindergarten={linkedKindergarten} />
        ) : (
          <GuardianKindergartenEmptyState />
        )}
      </div>
    </div>
  );
}
