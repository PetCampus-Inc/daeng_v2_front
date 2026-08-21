'use client';

import { useMemo } from 'react';

import { useGuardianHomeQuery } from '@entities/guardian-home';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { startOfDay } from '@shared/lib/calendar-date';

import type { GuardianLinkedKindergarten } from './guardianKindergartenConnection';
import { useGuardianSelectedPet } from './useGuardianSelectedPet';

/**
 * 보호자 유치원 탭 홈 (`GET guardian/school/home`) 기반 view model.
 */
function useGuardianKindergartenHome(options?: { petId?: string | null }) {
  const userId = useUserStore((state) => state.user?.userId);
  const {
    hasNoPet,
    isPetsReady,
    isPetsError,
    isPetsFetching,
    refetchPets,
    selectedPet,
    selectedPetId: storePetId,
  } = useGuardianSelectedPet();
  const selectedPetId = options?.petId || storePetId;

  const { data: hasUnreadAlarm = false } = useHasUnreadNotificationQuery({
    userId,
    enabled: Boolean(userId),
  });

  const {
    data: home,
    isError: isHomeError,
    isFetching: isHomeFetching,
    isPending: isHomePending,
    refetch: refetchHome,
  } = useGuardianHomeQuery({
    userId,
    petId: selectedPetId,
    enabled: Boolean(userId) && Boolean(selectedPetId) && (Boolean(options?.petId) || (isPetsReady && !hasNoPet)),
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

  /** 해당 유치원 첫 등원일 — 캘린더 minDate·주황점 하한 */
  const firstAttendedAt = useMemo(() => {
    if (!home?.firstAttendedAt) return null;
    return startOfDay(home.firstAttendedAt);
  }, [home?.firstAttendedAt]);

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
    firstAttendedAt,
    hasUnreadAlarm,
    /** 홈 API는 알림장 본문을 주지 않음 — 배너만 todayNoteArrived로 노출 */
    hasDailyNotice,
    albumPhotos,
  };
}

export { useGuardianKindergartenHome };
