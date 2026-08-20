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
  const hasLinkedSchool = Boolean(todaySchoolId) && (options?.schoolId != null || status !== 'none');

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
    enabled: isPetsReady && !hasNoPet && Boolean(todaySchoolId) && (options?.schoolId != null || status !== 'none'),
  });

  const todayPhotos = useMemo(() => todayAlbum?.photos ?? [], [todayAlbum?.photos]);

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
    isAttendedToday: todayAlbum?.isAttendedToday ?? false,
    todayPhotoCount: todayAlbum?.todayPhotoCount ?? 0,
    todayPhotos,
    todayDate: todayAlbum?.date ?? null,
    isReady,
    isError: isHomeError || (hasLinkedSchool && isTodayError),
    isFetching: isHomeFetching || isTodayFetching,
    refetch: async () => {
      await refetchHome();
      if (todaySchoolId) await refetchToday();
    },
  };
}

export { useGuardianAlbumToday };
