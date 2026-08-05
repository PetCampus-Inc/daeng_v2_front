import { useQuery } from '@tanstack/react-query';

import { toOwnerHome } from '../model/ownerHome';
import { getOwnerHome } from './ownerHome';

const OWNER_HOME_QUERY_KEY = 'ownerHome';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 홈 데이터가 남지 않도록 함 */
const ownerHomeQueryKey = (userId?: string) => [OWNER_HOME_QUERY_KEY, userId] as const;

interface UseOwnerHomeQueryOptions {
  userId?: string;
  enabled?: boolean;
}

function useOwnerHomeQuery({ userId, enabled = true }: UseOwnerHomeQueryOptions = {}) {
  return useQuery({
    queryKey: ownerHomeQueryKey(userId),
    queryFn: getOwnerHome,
    select: (response) => toOwnerHome(response.data),
    enabled,
    staleTime: 0,
  });
}

export { OWNER_HOME_QUERY_KEY, ownerHomeQueryKey, useOwnerHomeQuery };
