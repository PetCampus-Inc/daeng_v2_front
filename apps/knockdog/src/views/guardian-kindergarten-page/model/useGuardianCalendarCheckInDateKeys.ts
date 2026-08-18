'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import {
  getGuardianCalendarDetail,
  guardianCalendarDetailQueryKey,
  toGuardianCalendarDetail,
  type GuardianCalendarDetail,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';

interface UseGuardianCalendarCheckInDateKeysOptions {
  petId?: string | null;
  /** YYYY-MM-DD */
  dateKeys: string[];
  enabled?: boolean;
}

function hasCheckIn(detail: GuardianCalendarDetail | undefined) {
  if (!detail) return false;
  if (detail.checkInAt) return true;
  const status = detail.checkinoutStatus;
  return status === 'CHECKED_IN' || status === 'CHECKED_OUT';
}

/**
 * 보이는 날짜 구간의 등원 여부.
 * `attendance-records/.../dates`는 발송(SENT) 기준이라 등원만 한 날이 빠질 수 있음.
 */
function useGuardianCalendarCheckInDateKeys({
  petId,
  dateKeys,
  enabled = true,
}: UseGuardianCalendarCheckInDateKeysOptions) {
  const userId = useUserStore((state) => state.user?.userId);
  const canQuery = enabled && Boolean(userId) && Boolean(petId) && dateKeys.length > 0;
  const dateKeysKey = dateKeys.join(',');

  const queries = useQueries({
    queries: dateKeys.map((date) => ({
      queryKey: guardianCalendarDetailQueryKey(userId, petId ?? undefined, date),
      queryFn: () => getGuardianCalendarDetail({ petId: petId!, date }),
      select: (response: Awaited<ReturnType<typeof getGuardianCalendarDetail>>) =>
        toGuardianCalendarDetail(response.data),
      enabled: canQuery,
      staleTime: 0,
    })),
  });

  const checkInFlagsKey = queries
    .map((query) => (hasCheckIn(query.data) ? '1' : query.isPending ? 'p' : '0'))
    .join('');

  const checkInDateKeys = useMemo(() => {
    const keys = new Set<string>();
    const resolvedDateKeys = dateKeysKey ? dateKeysKey.split(',') : [];
    resolvedDateKeys.forEach((dateKey, index) => {
      if (hasCheckIn(queries[index]?.data)) keys.add(dateKey);
    });
    return keys;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- checkInFlagsKey로 결과 변경 추적
  }, [dateKeysKey, checkInFlagsKey]);

  const isReady = !canQuery || queries.every((query) => !query.isPending);
  const hasError = canQuery && queries.some((query) => query.isError);

  return {
    checkInDateKeys,
    isReady,
    hasError,
  };
}

export { useGuardianCalendarCheckInDateKeys };
