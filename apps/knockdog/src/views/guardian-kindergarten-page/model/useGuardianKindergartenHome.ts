'use client';

import { useMemo } from 'react';

import { useGuardianHomeQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { formatDateKey } from '@shared/lib/calendar-date';

import type { GuardianLinkedKindergarten } from './guardianKindergartenConnection';
import { useGuardianSelectedPet } from './useGuardianSelectedPet';

/**
 * 보호자 유치원 탭 홈 (`GET guardian/school/home`) 기반 view model.
 */
function useGuardianKindergartenHome() {
  const userId = useUserStore((state) => state.user?.userId);
  const {
    hasNoPet,
    isPetsReady,
    isPetsError,
    isPetsFetching,
    refetchPets,
    selectedPet,
    selectedPetId,
  } = useGuardianSelectedPet();

  const {
    data: home,
    isError: isHomeError,
    isFetching: isHomeFetching,
    isPending: isHomePending,
    refetch: refetchHome,
  } = useGuardianHomeQuery({
    userId,
    petId: selectedPetId,
    enabled: isPetsReady && !hasNoPet && Boolean(selectedPetId),
  });

  const status = home?.status ?? 'none';
  const linkedKindergarten: GuardianLinkedKindergarten | null = home?.school
    ? {
        id: home.school.id,
        name: home.school.name,
        address: home.school.address,
        imageUrl: home.school.imageUrl,
      }
    : null;

  const checkInAt = home?.checkInAt ?? null;
  const checkOutAt = home?.checkOutAt ?? null;
  const isDismissed = Boolean(checkInAt && checkOutAt);
  const isAttending = Boolean(checkInAt && !checkOutAt);
  const hasDailyNotice = Boolean(home?.todayNoteArrived);
  const albumPhotos = useMemo(
    () => (home?.todayAlbumPreview ?? []).slice(0, 3).map((photo) => photo.imageUrl),
    [home?.todayAlbumPreview]
  );

  const attendanceRecordDateKeys = useMemo(() => {
    const keys = new Set<string>();
    if (checkInAt) keys.add(formatDateKey(checkInAt));
    return keys;
  }, [checkInAt]);

  const isHomeReady = hasNoPet || (!isHomePending && home !== undefined) || isHomeError;

  return {
    selectedPet,
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
    hasUnreadAlarm: false,
    /** 홈 API는 알림장 본문을 주지 않음 — 배너만 todayNoteArrived로 노출 */
    hasDailyNotice,
    albumPhotos,
    attendanceRecordDateKeys,
  };
}

export { useGuardianKindergartenHome };
