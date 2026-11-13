'use client';

import { useQuery } from '@tanstack/react-query';

import { getGuardianDiaryDate } from './guardianDiary';

const guardianDiaryDateQueryKey = (petId?: string | null, date?: string | null) =>
  ['guardianDiaryDate', petId, date] as const;

interface UseGuardianDiaryDateQueryOptions {
  petId?: string | null;
  date?: string | null;
  enabled?: boolean;
}

function useGuardianDiaryDateQuery({ petId, date, enabled = true }: UseGuardianDiaryDateQueryOptions) {
  return useQuery({
    queryKey: guardianDiaryDateQueryKey(petId, date),
    queryFn: () => getGuardianDiaryDate(petId!, date!),
    enabled: enabled && Boolean(petId) && Boolean(date),
  });
}

export { guardianDiaryDateQueryKey, useGuardianDiaryDateQuery };
