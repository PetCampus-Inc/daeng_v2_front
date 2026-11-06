import { useQuery } from '@tanstack/react-query';

import { toOwnerMembersResponse, toOwnerPendingMembersResponse } from '../model/ownerMember';
import { getOwnerMembers, getOwnerPendingMembers, postOwnerInvite } from './ownerMember';

const OWNER_MEMBERS_QUERY_KEY = 'ownerMembers';
const OWNER_PENDING_QUERY_KEY = 'ownerPendingMembers';
const OWNER_INVITE_QUERY_KEY = 'ownerInvite';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 구성원 목록이 남지 않도록 함 */
const ownerMembersQueryKey = (userId?: string) => [OWNER_MEMBERS_QUERY_KEY, userId] as const;
const ownerPendingMembersQueryKey = (userId?: string) =>
  [OWNER_PENDING_QUERY_KEY, userId] as const;
const ownerInviteQueryKey = (userId?: string) => [OWNER_INVITE_QUERY_KEY, userId] as const;

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

function useOwnerPendingMembersQuery({ userId, enabled = true }: UseOwnerMembersQueryOptions = {}) {
  return useQuery({
    queryKey: ownerPendingMembersQueryKey(userId),
    queryFn: getOwnerPendingMembers,
    select: (response) => toOwnerPendingMembersResponse(response.data),
    enabled,
    staleTime: 0,
  });
}

function useOwnerInviteQuery({ userId, enabled = true }: UseOwnerMembersQueryOptions = {}) {
  return useQuery({
    queryKey: ownerInviteQueryKey(userId),
    queryFn: postOwnerInvite,
    select: (response) => response.data,
    enabled,
    staleTime: Infinity,
  });
}

export {
  OWNER_INVITE_QUERY_KEY,
  OWNER_MEMBERS_QUERY_KEY,
  OWNER_PENDING_QUERY_KEY,
  ownerInviteQueryKey,
  ownerMembersQueryKey,
  ownerPendingMembersQueryKey,
  useOwnerInviteQuery,
  useOwnerMembersQuery,
  useOwnerPendingMembersQuery,
};
