'use client';

import { useQuery } from '@tanstack/react-query';

import { getGuardianDiaryMonth } from './guardianDiary';

const guardianDiaryMonthQueryKey = (petId?: string | null, yearMonth?: string | null) =>
  ['guardianDiaryMonth', petId, yearMonth] as const;

interface UseGuardianDiaryMonthQueryOptions {
  petId?: string | null;
  yearMonth?: string | null;
  enabled?: boolean;
}

function useGuardianDiaryMonthQuery({ petId, yearMonth, enabled = true }: UseGuardianDiaryMonthQueryOptions) {
  return useQuery({
    queryKey: guardianDiaryMonthQueryKey(petId, yearMonth),
    queryFn: () => getGuardianDiaryMonth(petId!, yearMonth!),
    enabled: enabled && Boolean(petId) && Boolean(yearMonth),
  });
}

export { guardianDiaryMonthQueryKey, useGuardianDiaryMonthQuery };
