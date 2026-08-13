'use client';

import { useMemo } from 'react';

import {
  formatGuardianAlbumYearMonth,
  useGuardianAlbumMonthQuery,
} from '@entities/guardian-album';
import { useUserStore } from '@entities/user';

interface UseGuardianAlbumMonthParams {
  schoolId?: string | null;
  petId?: string | null;
  selectedMonth: Date;
  enabled?: boolean;
}

/**
 * 보호자 앨범 월별 리스트 — `GET albums/{schoolId}/months/{yearMonth}?petId=`
 */
function useGuardianAlbumMonth({
  schoolId,
  petId,
  selectedMonth,
  enabled = true,
}: UseGuardianAlbumMonthParams) {
  const userId = useUserStore((state) => state.user?.userId);
  const yearMonth = useMemo(
    () => formatGuardianAlbumYearMonth(selectedMonth),
    [selectedMonth]
  );

  const query = useGuardianAlbumMonthQuery({
    userId,
    schoolId,
    petId,
    yearMonth,
    enabled: enabled && Boolean(schoolId) && Boolean(petId),
  });

  return {
    yearMonth,
    monthAlbum: query.data,
    days: query.data?.days ?? [],
    firstAvailableMonth: query.data?.firstAvailableMonth ?? null,
    lastAvailableMonth: query.data?.lastAvailableMonth ?? null,
    connectionStartedAt: query.data?.connectionStartedAt ?? null,
    isError: query.isError,
    isFetching: query.isFetching,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}

export { useGuardianAlbumMonth };
