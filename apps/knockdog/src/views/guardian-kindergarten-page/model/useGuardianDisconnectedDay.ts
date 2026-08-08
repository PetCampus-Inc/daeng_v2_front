'use client';

import { useCallback, useMemo } from 'react';

import { MOCK_DISCONNECTED } from '../config/guardianDisconnectedMock';
import { useGuardianSelectedPet } from './useGuardianSelectedPet';

/** 연결 해제 화면용 mock (마지막 앨범·해제일·일자별 기록) */
function useGuardianDisconnectedDay() {
  const { selectedPet } = useGuardianSelectedPet();
  const disconnected = MOCK_DISCONNECTED;
  const disconnectedAt = useMemo(
    () => new Date(`${disconnected.disconnectedAt}T00:00:00`),
    [disconnected.disconnectedAt]
  );

  const lastAlbumPhotos = useMemo(() => {
    const count = Math.min(3, Math.max(0, disconnected.lastAlbumPhotoCount));
    const petImage = selectedPet?.profileImage;
    if (!petImage || count === 0) return [] as string[];
    return Array.from({ length: count }, () => petImage);
  }, [disconnected.lastAlbumPhotoCount, selectedPet?.profileImage]);

  const attendanceRecordDateKeys = useMemo(
    () => new Set(disconnected.recordDateKeys),
    [disconnected.recordDateKeys]
  );

  const getDayRecord = useCallback(
    (dateKey: string) => disconnected.daysByDateKey[dateKey] ?? null,
    [disconnected.daysByDateKey]
  );

  return {
    disconnectedAt,
    disconnectedAtKey: disconnected.disconnectedAt,
    lastAlbumPhotos,
    attendanceRecordDateKeys,
    getDayRecord,
  };
}

export { useGuardianDisconnectedDay };
