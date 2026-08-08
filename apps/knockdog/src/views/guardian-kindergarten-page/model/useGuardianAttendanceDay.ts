'use client';

import { useMemo } from 'react';

import { MOCK_ATTENDANCE_DAY } from '../config/guardianAttendanceMock';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';
import { useGuardianSelectedPet } from './useGuardianSelectedPet';

/**
 * 등원일 mock 데이터.
 * 등원 중 = 원장 등원처리 + checkInAt 존재
 */
function useGuardianAttendanceDay() {
  const attendanceOverride = useGuardianKindergartenMockStore((state) => state.attendanceOverride);
  const { selectedPet } = useGuardianSelectedPet();

  const attendance = attendanceOverride ?? MOCK_ATTENDANCE_DAY;
  const isAttending = Boolean(attendance.checkInAt);
  const checkInAt = attendance.checkInAt ? new Date(attendance.checkInAt) : null;

  const albumPhotos = useMemo(() => {
    const count = Math.min(3, Math.max(0, attendance.albumPhotoCount));
    const petImage = selectedPet?.profileImage;
    if (!petImage || count === 0) return [] as string[];
    return Array.from({ length: count }, () => petImage);
  }, [attendance.albumPhotoCount, selectedPet?.profileImage]);

  return {
    isAttending,
    checkInAt,
    hasUnreadAlarm: attendance.hasUnreadAlarm,
    hasDailyNotice: attendance.hasDailyNotice,
    albumPhotos,
  };
}

export { useGuardianAttendanceDay };
