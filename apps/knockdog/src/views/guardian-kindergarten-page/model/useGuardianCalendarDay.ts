'use client';

import { useMemo } from 'react';

import { useGuardianCalendarDetailQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import { useGuardianSelectedPet } from './useGuardianSelectedPet';

interface UseGuardianCalendarDayOptions {
  selectedDate: Date;
  enabled?: boolean;
  petId?: string | null;
  /** 생략 시 서버가 가장 최근 관계 유치원 사용 — 호출부에서 가능하면 항상 전달 */
  schoolId?: string | null;
}

/**
 * 선택 날짜의 등하원·알림장 (`GET guardian/school/calendar/detail`)
 * schoolId 없으면 요청하지 않는다 (서버 기본값=현재 연결로 과거 재연결 이력이 빠짐).
 */
function useGuardianCalendarDay({
  selectedDate,
  enabled = true,
  petId: petIdOverride,
  schoolId,
}: UseGuardianCalendarDayOptions) {
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId } = useGuardianSelectedPet();
  const petId = petIdOverride || selectedPetId;
  const dateKey = useMemo(() => formatDateKey(startOfDay(selectedDate)), [selectedDate]);

  const {
    data: dayDetail,
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useGuardianCalendarDetailQuery({
    userId,
    petId,
    date: dateKey,
    schoolId,
    enabled: enabled && Boolean(petId) && Boolean(schoolId),
  });

  return {
    dateKey,
    checkInAt: dayDetail?.checkInAt ?? null,
    checkOutAt: dayDetail?.checkOutAt ?? null,
    dailyNotice: dayDetail?.dailyNotice ?? null,
    error,
    isError,
    isFetching,
    isPending,
    isReady: !isPending || dayDetail !== undefined || isError,
    refetch,
  };
}

export { useGuardianCalendarDay };
