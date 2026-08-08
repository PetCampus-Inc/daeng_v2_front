'use client';

import { useMemo } from 'react';

import { formatDateKey } from '@shared/lib/calendar-date';

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
  const dailyNotice =
    attendance.hasDailyNotice && attendance.dailyNotice ? attendance.dailyNotice : null;

  const albumPhotos = useMemo(() => {
    const count = Math.min(3, Math.max(0, attendance.albumPhotoCount));
    const petImage = selectedPet?.profileImage;
    if (!petImage || count === 0) return [] as string[];
    return Array.from({ length: count }, () => petImage);
  }, [attendance.albumPhotoCount, selectedPet?.profileImage]);

  const attendanceRecordDateKeys = useMemo(() => {
    const keys = new Set(attendance.recordDateKeys ?? []);
    if (checkInAt) keys.add(formatDateKey(checkInAt));
    return keys;
  }, [attendance.recordDateKeys, checkInAt]);

  return {
    isAttending,
    checkInAt,
    hasUnreadAlarm: attendance.hasUnreadAlarm,
    hasDailyNotice: Boolean(dailyNotice),
    dailyNotice,
    albumPhotos,
    attendanceRecordDateKeys,
  };
}

export { useGuardianAttendanceDay };
