'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { OwnerVerificationEntry } from '@features/auth';
import { useOwnerRole } from '@features/role-conversion';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useTabNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';
import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';

import { GuardianKindergartenApprovedState } from './GuardianKindergartenApprovedState';
import { GuardianKindergartenAttendingState } from './GuardianKindergartenAttendingState';
import { GuardianKindergartenDisconnectedState } from './GuardianKindergartenDisconnectedState';
import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';
import { GuardianKindergartenHeader } from './GuardianKindergartenHeader';
import { GuardianKindergartenNoPetState } from './GuardianKindergartenNoPetState';
import { GuardianKindergartenPendingState } from './GuardianKindergartenPendingState';

function parsePushDate(value: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function GuardianKindergartenPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const { navigateToTab } = useTabNavigation();
  const setSelectedPetId = useGuardianSelectedPetStore((state) => state.setSelectedPetId);
  const pushPetId = searchParams.get('pushPetId');
  const pushDateKey = searchParams.get('pushDate');
  const pushDate = useMemo(() => parsePushDate(pushDateKey), [pushDateKey]);

  useEffect(() => {
    if (!pushPetId || !/^\d+$/.test(pushPetId)) return;
    setSelectedPetId(pushPetId);
  }, [pushPetId, setSelectedPetId]);

  const handleAuthError = useCallback(
    async (_error: Error) => {
      await navigateToTab('/');
    },
    [navigateToTab]
  );

  const hasAuth = useRequireAuth(handleAuthError);
  const { isOwner: isOwnerVerified, isResolved: isOwnerRoleResolved } = useOwnerRole();
  const {
    hasNoPet,
    isPetsReady,
    isPetsError,
    isPetsFetching,
    refetchPets,
    isHomeError,
    isHomeFetching,
    isHomeReady,
    refetchHome,
    status,
    linkedKindergarten,
    isAttending,
    isDismissed,
    checkInAt,
    checkOutAt,
    firstAttendedAt,
    hasUnreadAlarm,
    hasDailyNotice,
    albumPhotos,
  } = useGuardianKindergartenHome();

  useEffect(() => {
    setIsMounted(true);
    setIsLoggedIn(hasAuth);
  }, [hasAuth]);

  const handleRetry = useCallback(() => {
    if (isPetsError) {
      void refetchPets();
      return;
    }
    void refetchHome();
  }, [isPetsError, refetchHome, refetchPets]);

  if (!isMounted || !isLoggedIn || !isPetsReady) return null;

  if (isPetsError || (!hasNoPet && isHomeError)) {
    return (
      <PageError
        isRetrying={isPetsError ? isPetsFetching : isHomeFetching}
        onRetry={handleRetry}
      />
    );
  }

  if (!hasNoPet && !isHomeReady) return null;

  const showDayState =
    !hasNoPet &&
    status === 'approved' &&
    linkedKindergarten &&
    checkInAt &&
    (isAttending || isDismissed);
  const showDisconnected = !hasNoPet && status === 'disconnected' && linkedKindergarten;
  const showApproved = !hasNoPet && !showDayState && status === 'approved' && linkedKindergarten;
  const showPending = !hasNoPet && status === 'pending' && linkedKindergarten;
  const showEmpty = !hasNoPet && !showDayState && !showDisconnected && !showApproved && !showPending;
  // 강아지 미등록 또는 연결된 유치원이 아예 없는 경우에만 노출한다.
  const shouldShowOwnerVerification =
    isLoggedIn && isOwnerRoleResolved && !isOwnerVerified && (hasNoPet || showEmpty);

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
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
            albumPhotos={albumPhotos}
            firstAttendedAt={firstAttendedAt}
            initialSelectedDate={pushDate}
          />
        ) : showDisconnected ? (
          <GuardianKindergartenDisconnectedState kindergarten={linkedKindergarten} initialSelectedDate={pushDate} />
        ) : showApproved ? (
          <GuardianKindergartenApprovedState
            kindergarten={linkedKindergarten}
            firstAttendedAt={firstAttendedAt}
            initialSelectedDate={pushDate}
          />
        ) : showPending ? (
          <GuardianKindergartenPendingState kindergarten={linkedKindergarten} />
        ) : (
          <GuardianKindergartenEmptyState />
        )}
      </div>

      {shouldShowOwnerVerification && (
        <div
          className='fixed inset-x-0 z-50 mx-auto w-full max-w-120 px-4'
          style={{ bottom: `calc(${BOTTOM_BAR_HEIGHT + 20}px + var(--safe-area-inset-bottom, 0px))` }}
        >
          <OwnerVerificationEntry requiresLogin={false} variant='banner' />
        </div>
      )}
    </div>
  );
}
