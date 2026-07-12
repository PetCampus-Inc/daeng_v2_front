import { useQuery } from '@tanstack/react-query';
import { getUserInfo, getOwnerRole } from './user';

const useUserInfoQuery = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: getUserInfo,
    select: (data) => data.data,
  });
};

const OWNER_ROLE_QUERY_KEY = 'ownerRole';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 상태가 남지 않도록 함 */
const ownerRoleQueryKey = (userId?: string) => [OWNER_ROLE_QUERY_KEY, userId] as const;

interface UseOwnerRoleQueryOptions {
  userId?: string;
  enabled?: boolean;
}

const useOwnerRoleQuery = ({ userId, enabled = true }: UseOwnerRoleQueryOptions = {}) => {
  return useQuery({
    queryKey: ownerRoleQueryKey(userId),
    queryFn: getOwnerRole,
    select: (data) => data.data,
    enabled,
    staleTime: 0,
  });
};

export { useUserInfoQuery, useOwnerRoleQuery, OWNER_ROLE_QUERY_KEY, ownerRoleQueryKey };
