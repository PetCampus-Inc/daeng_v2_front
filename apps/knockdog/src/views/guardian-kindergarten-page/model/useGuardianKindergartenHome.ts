'use client';

import { useMemo } from 'react';

import { useGuardianCalendarDetailQuery, useGuardianHomeQuery } from '@entities/guardian-home';
import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import type { GuardianLinkedKindergarten } from './guardianKindergartenConnection';
import { useGuardianSelectedPet } from './useGuardianSelectedPet';

/**
 * 보호자 유치원 탭 홈 (`GET guardian/school/home`) 기반 view model.
 * 재연결 직후 home이 등원 시각을 안 주는 경우 오늘 calendar/detail로 보강
 */
function useGuardianKindergartenHome(options?: { petId?: string | null; enabled?: boolean }) {
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
  const isEnabled = options?.enabled ?? true;

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
    enabled:
      isEnabled &&
      Boolean(userId) &&
      Boolean(selectedPetId) &&
      (Boolean(options?.petId) || (isPetsReady && !hasNoPet)),
  });

  const status = home?.status ?? 'none';
  const linkedKindergarten: GuardianLinkedKindergarten | null = home?.school
    ? {
        id: home.school.id,
        placeId: home.school.placeId,
        name: home.school.name,
        address: home.school.address,
        imageUrl: home.school.imageUrl,
      }
    : null;

  const todayDateKey = useMemo(() => formatDateKey(startOfDay(new Date())), []);
  /** home이 등원 전인데 실제 등원 기록이 있는 재연결 케이스 보강 */
  const shouldResolveTodayAttendance =
    status === 'approved' && Boolean(linkedKindergarten?.id) && !home?.checkInAt;

  const {
    data: todayDetail,
    isPending: isTodayDetailPending,
    isError: isTodayDetailError,
  } = useGuardianCalendarDetailQuery({
    userId,
    petId: selectedPetId,
    date: todayDateKey,
    schoolId: linkedKindergarten?.id,
    enabled:
      isEnabled &&
      shouldResolveTodayAttendance &&
      Boolean(userId) &&
      Boolean(selectedPetId) &&
      Boolean(linkedKindergarten?.id),
  });

  const checkInAt = home?.checkInAt ?? todayDetail?.checkInAt ?? null;
  const checkOutAt = home?.checkInAt
    ? (home.checkOutAt ?? null)
    : (todayDetail?.checkOutAt ?? null);
  const isDismissed = Boolean(checkInAt && checkOutAt);
  const isAttending = Boolean(checkInAt && !checkOutAt);
  const hasDailyNotice = Boolean(home?.todayNoteArrived);
  const albumPhotos = useMemo(
    () => (home?.todayAlbumPreview ?? []).slice(0, 3).map((photo) => photo.imageUrl),
    [home?.todayAlbumPreview]
  );
  const albumLatestCreatedAt = useMemo(() => {
    const times = (home?.todayAlbumPreview ?? [])
      .map((photo) => (photo.createdAt ? new Date(photo.createdAt).getTime() : Number.NaN))
      .filter((time) => Number.isFinite(time));
    return times.length > 0 ? Math.max(...times) : null;
  }, [home?.todayAlbumPreview]);

  /** 해당 유치원 첫 등원일 — 캘린더 minDate·주황점 하한 */
  const firstAttendedAt = useMemo(() => {
    if (!home?.firstAttendedAt) return null;
    return startOfDay(home.firstAttendedAt);
  }, [home?.firstAttendedAt]);

  const isTodayAttendanceResolving =
    shouldResolveTodayAttendance && isTodayDetailPending && !isTodayDetailError;
  const isHomeReady =
    hasNoPet ||
    ((!isHomePending && home !== undefined) || isHomeError) &&
      !isTodayAttendanceResolving;

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
    albumLatestCreatedAt,
  };
}

export { useGuardianKindergartenHome };
