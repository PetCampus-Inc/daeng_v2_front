import { useQuery } from '@tanstack/react-query';

import { toGuardianHome } from '../model/guardianHome';
import { getGuardianSchoolHome } from './guardianHome';

const GUARDIAN_HOME_QUERY_KEY = 'guardianHome';

/** 유저·선택견별로 캐시를 분리해 계정/강아지 전환 시 이전 홈 데이터가 남지 않도록 함 */
const guardianHomeQueryKey = (userId?: string, petId?: string) =>
  [GUARDIAN_HOME_QUERY_KEY, userId, petId] as const;

interface UseGuardianHomeQueryOptions {
  userId?: string;
  petId?: string | null;
  enabled?: boolean;
}

function useGuardianHomeQuery({
  userId,
  petId,
  enabled = true,
}: UseGuardianHomeQueryOptions = {}) {
  return useQuery({
    queryKey: guardianHomeQueryKey(userId, petId ?? undefined),
    queryFn: () => getGuardianSchoolHome({ petId: petId! }),
    select: (response) => toGuardianHome(response.data),
    enabled: enabled && Boolean(userId) && Boolean(petId),
    staleTime: 0,
  });
}

export { GUARDIAN_HOME_QUERY_KEY, guardianHomeQueryKey, useGuardianHomeQuery };
