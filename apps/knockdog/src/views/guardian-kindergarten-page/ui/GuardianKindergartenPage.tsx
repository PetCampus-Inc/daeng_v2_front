'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { OwnerVerificationEntry, useOwnerRole } from '@features/role-conversion';
import { useTabNavigation } from '@shared/lib/bridge';
import {
  isPetIdInList,
  parseNotificationEntrySource,
  useUnavailableNotificationAction,
} from '@shared/lib/notification';
import { PageError } from '@shared/ui/page-error';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';

import { GuardianKindergartenApprovedState } from './GuardianKindergartenApprovedState';
import { GuardianKindergartenAttendingState } from './GuardianKindergartenAttendingState';
import { GuardianKindergartenDisconnectedState } from './GuardianKindergartenDisconnectedState';
import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';
import { GuardianKindergartenHeader } from './GuardianKindergartenHeader';
import { GuardianKindergartenNoPetState } from './GuardianKindergartenNoPetState';
import { GuardianKindergartenPendingState } from './GuardianKindergartenPendingState';

export function GuardianKindergartenPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const { navigateToTab } = useTabNavigation();
  const {
    pets,
    isPetsReady,
    isPetsError,
    setSelectedPetId,
    refetchPets: refetchPetsForPushPet,
  } = useGuardianSelectedPet();
  const { rejectUnavailableTabTarget } = useUnavailableNotificationAction();
  const pushPetIdFromRouter = searchParams.get('pushPetId');

  /** Native는 history.replaceState라 Next useSearchParams가 안 바뀐다. location을 직접 읽는다. */
  useEffect(() => {
    if (!isPetsReady || isPetsError) return;

    function readPushPetFromLocation() {
      const params = new URLSearchParams(window.location.search);
      const petId = params.get('pushPetId') ?? pushPetIdFromRouter;
      const source = parseNotificationEntrySource(params.get('source'));
      return { petId, source };
    }

    function clearPushPetQuery() {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('pushPetId') && !url.searchParams.has('source')) return;
      url.searchParams.delete('pushPetId');
      url.searchParams.delete('source');
      url.searchParams.delete('pushDate');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }

    async function applyPushPetFromLocation() {
      const { petId, source } = readPushPetFromLocation();
      if (!petId || !/^\d+$/.test(petId)) return;

      if (isPetIdInList(pets, petId)) {
        setSelectedPetId(petId);
        clearPushPetQuery();
        return;
      }

      // 방금 막 승인된 신규 연결이면 pets 캐시(기본 staleTime 60초)가 오래돼
      // 아직 목록에 없을 수 있다. 포기하기 전에 최신 데이터로 한 번 더 확인한다.
      const fresh = await refetchPetsForPushPet();

      // await 중 popstate로 다른 pushPetId가 들어왔으면 이 시도는 이미 낡은 것이다.
      // 그대로 진행하면 방금 도착한 새 petId를 이 낡은 결과로 덮어쓸 수 있다.
      if (readPushPetFromLocation().petId !== petId) return;

      // 재조회 자체가 실패한 거면(네트워크 오류 등) "강아지가 없다"고 확정할 수 없다.
      // 잘못 unavailable 처리하지 않고 다음 트리거(popstate 등)를 기다린다.
      if (!fresh.isSuccess) return;

      const freshPets = fresh.data?.data ?? [];
      if (isPetIdInList(freshPets, petId)) {
        setSelectedPetId(petId);
        clearPushPetQuery();
        return;
      }

      // 삭제된 강아지: 다른 강아지로 갈아타지 않는다. 푸시는 홈 유지, 알림함은 토스트.
      rejectUnavailableTabTarget(source);
      clearPushPetQuery();
    }

    void applyPushPetFromLocation();
    window.addEventListener('popstate', applyPushPetFromLocation);
    return () => window.removeEventListener('popstate', applyPushPetFromLocation);
  }, [
    isPetsError,
    isPetsReady,
    pets,
    pushPetIdFromRouter,
    refetchPetsForPushPet,
    rejectUnavailableTabTarget,
    setSelectedPetId,
  ]);

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
    albumLatestCreatedAt,
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
        layout='overlay'
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
        hasUnreadAlarm={hasUnreadAlarm}
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
            albumLatestCreatedAt={albumLatestCreatedAt}
            firstAttendedAt={firstAttendedAt}
          />
        ) : showDisconnected ? (
          <GuardianKindergartenDisconnectedState
            kindergarten={linkedKindergarten}
            albumPhotos={albumPhotos}
            firstAttendedAt={firstAttendedAt}
          />
        ) : showApproved ? (
          <GuardianKindergartenApprovedState
            kindergarten={linkedKindergarten}
            firstAttendedAt={firstAttendedAt}
          />
        ) : showPending ? (
          <GuardianKindergartenPendingState kindergarten={linkedKindergarten} />
        ) : (
          <GuardianKindergartenEmptyState />
        )}
      </div>

      {shouldShowOwnerVerification && (
        <div className='web:bottom-[calc(var(--bottom-bar-height)+20px)] webview:bottom-5 fixed inset-x-0 z-50 mx-auto w-full max-w-120 px-4'>
          <OwnerVerificationEntry requiresLogin={false} variant='banner' />
        </div>
      )}
    </div>
  );
}
