'use client';

import { useMemo } from 'react';

import { useGuardianCalendarDetailQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import { useGuardianSelectedPet } from './useGuardianSelectedPet';

interface UseGuardianCalendarDayOptions {
  selectedDate: Date;
  enabled?: boolean;
}

/**
 * 선택 날짜의 등하원·알림장 (`GET guardian/school/calendar/detail`)
 */
function useGuardianCalendarDay({ selectedDate, enabled = true }: UseGuardianCalendarDayOptions) {
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId } = useGuardianSelectedPet();
  const dateKey = useMemo(() => formatDateKey(startOfDay(selectedDate)), [selectedDate]);

  const {
    data: dayDetail,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useGuardianCalendarDetailQuery({
    userId,
    petId: selectedPetId,
    date: dateKey,
    enabled: enabled && Boolean(selectedPetId),
  });

  return {
    dateKey,
    checkInAt: dayDetail?.checkInAt ?? null,
    checkOutAt: dayDetail?.checkOutAt ?? null,
    dailyNotice: dayDetail?.dailyNotice ?? null,
    isError,
    isFetching,
    isPending,
    isReady: !isPending || dayDetail !== undefined || isError,
    refetch,
  };
}

export { useGuardianCalendarDay };
