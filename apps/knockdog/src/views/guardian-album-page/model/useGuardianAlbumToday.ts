'use client';

import { useMemo } from 'react';

import { useGuardianAlbumTodayQuery } from '@entities/guardian-album';
import { useGuardianHomeQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

/**
 * 보호자 앨범 오늘 섹션 — home에서 schoolId 확보 후 `GET albums/{schoolId}/today` 조회.
 * `schoolId`가 있으면 선택 유치원 기준으로 today를 조회한다.
 */
function useGuardianAlbumToday(options?: { schoolId?: string | null }) {
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPet, selectedPetId, isPetsReady, hasNoPet } = useGuardianSelectedPet();

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
  const schoolId = home?.school?.id ?? null;
  const todaySchoolId = options?.schoolId || schoolId;
  const schoolName = home?.school?.name ?? null;
  const schoolImageUrl = home?.school?.imageUrl ?? null;
  const hasExplicitSchoolId = options?.schoolId != null && options.schoolId !== '';
  /** pending/none은 today 조회하지 않음. 선택 schoolId(이력) 또는 approved/disconnected만 */
  const canFetchToday =
    Boolean(todaySchoolId) &&
    (hasExplicitSchoolId || status === 'approved' || status === 'disconnected');
  const hasLinkedSchool = Boolean(todaySchoolId) && canFetchToday;

  const {
    data: todayAlbum,
    isError: isTodayError,
    isFetching: isTodayFetching,
    isPending: isTodayPending,
    refetch: refetchToday,
  } = useGuardianAlbumTodayQuery({
    userId,
    schoolId: todaySchoolId,
    petId: selectedPetId,
    enabled: isPetsReady && !hasNoPet && canFetchToday,
  });

  const todayPhotos = useMemo(() => todayAlbum?.photos ?? [], [todayAlbum?.photos]);

  /**
   * 재원(approved) + 홈 유치원 기준일 때만 등원(checkIn) 교차 검증.
   * 미등원이면 Today 이미지 비노출. 해제/선택 이력 유치원은 today API 데이터 유지.
   */
  const isAttendedTodayRaw = todayAlbum?.isAttendedToday ?? false;
  const suppressUnattendedPreview =
    status === 'approved' && !hasExplicitSchoolId && !home?.checkInAt;
  const isAttendedToday = suppressUnattendedPreview
    ? false
    : status === 'approved' && !hasExplicitSchoolId
      ? isAttendedTodayRaw && Boolean(home?.checkInAt)
      : isAttendedTodayRaw;

  const isReady =
    hasNoPet ||
    (isPetsReady &&
      !isHomePending &&
      home !== undefined &&
      (!hasLinkedSchool || !isTodayPending || todayAlbum !== undefined || isTodayError));

  return {
    selectedPet,
    selectedPetId,
    status,
    schoolId,
    schoolName,
    schoolImageUrl,
    hasLinkedSchool,
    /** 연결 유치원이 있으면 앨범 탭 본문(월 리스트 등) 노출 */
    hasAlbumHistory: hasLinkedSchool,
    isAttendedToday,
    todayPhotoCount: suppressUnattendedPreview ? 0 : (todayAlbum?.todayPhotoCount ?? 0),
    todayPhotos: suppressUnattendedPreview ? [] : todayPhotos,
    todayDate: todayAlbum?.date ?? null,
    isReady,
    isError: isHomeError || (hasLinkedSchool && isTodayError),
    isFetching: isHomeFetching || isTodayFetching,
    refetch: async () => {
      await refetchHome();
      if (todaySchoolId && canFetchToday) await refetchToday();
    },
  };
}

export { useGuardianAlbumToday };
