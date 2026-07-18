import { useQuery } from '@tanstack/react-query';

import { toOwnerMembersResponse } from '../model/ownerMember';
import { getOwnerMembers } from './ownerMember';

const OWNER_MEMBERS_QUERY_KEY = 'ownerMembers';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 구성원 목록이 남지 않도록 함 */
const ownerMembersQueryKey = (userId?: string) => [OWNER_MEMBERS_QUERY_KEY, userId] as const;

interface UseOwnerMembersQueryOptions {
  userId?: string;
  enabled?: boolean;
}

function useOwnerMembersQuery({ userId, enabled = true }: UseOwnerMembersQueryOptions = {}) {
  return useQuery({
    queryKey: ownerMembersQueryKey(userId),
    queryFn: getOwnerMembers,
    select: (response) => toOwnerMembersResponse(response.data),
    enabled,
    staleTime: 0,
  });
}

export { OWNER_MEMBERS_QUERY_KEY, ownerMembersQueryKey, useOwnerMembersQuery };
