'use client';

import { useQuery } from '@tanstack/react-query';

import { getGuardianDiaryDetail } from './guardianDiary';

const guardianDiaryDetailQueryKey = (diaryId?: string | null) => ['guardianDiaryDetail', diaryId] as const;

interface UseGuardianDiaryDetailQueryOptions {
  diaryId?: string | null;
  enabled?: boolean;
}

function useGuardianDiaryDetailQuery({ diaryId, enabled = true }: UseGuardianDiaryDetailQueryOptions) {
  return useQuery({
    queryKey: guardianDiaryDetailQueryKey(diaryId),
    queryFn: () => getGuardianDiaryDetail(diaryId!),
    enabled: enabled && Boolean(diaryId),
  });
}

export { guardianDiaryDetailQueryKey, useGuardianDiaryDetailQuery };
