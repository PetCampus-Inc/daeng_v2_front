import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { toOwnerMembersResponse, toOwnerPendingMembersResponse } from '../model/ownerMember';
import {
  getOwnerMembers,
  getOwnerPendingMembers,
  postOwnerInvite,
  type GetOwnerMembersParams,
  type GetOwnerPendingMembersParams,
} from './ownerMember';

const OWNER_MEMBERS_QUERY_KEY = 'ownerMembers';
const OWNER_PENDING_QUERY_KEY = 'ownerPendingMembers';
const OWNER_INVITE_QUERY_KEY = 'ownerInvite';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 구성원 목록이 남지 않도록 함 */
const ownerMembersQueryKey = (userId?: string, params?: GetOwnerMembersParams) =>
  (params ? [OWNER_MEMBERS_QUERY_KEY, userId, params] : [OWNER_MEMBERS_QUERY_KEY, userId]) as readonly unknown[];
const ownerPendingMembersQueryKey = (userId?: string, params?: GetOwnerPendingMembersParams) =>
  (params ? [OWNER_PENDING_QUERY_KEY, userId, params] : [OWNER_PENDING_QUERY_KEY, userId]) as readonly unknown[];
const ownerInviteQueryKey = (userId?: string) => [OWNER_INVITE_QUERY_KEY, userId] as const;

interface UseOwnerMembersQueryOptions extends GetOwnerMembersParams {
  userId?: string;
  enabled?: boolean;
}

function useOwnerMembersQuery({ userId, keyword, filter, enabled = true }: UseOwnerMembersQueryOptions = {}) {
  const params = { keyword, filter };

  return useQuery({
    queryKey: ownerMembersQueryKey(userId, params),
    queryFn: () => getOwnerMembers(params),
    select: (response) => toOwnerMembersResponse(response.data),
    placeholderData: keepPreviousData,
    enabled,
    staleTime: 0,
  });
}

function useOwnerPendingMembersQuery({
  userId,
  sort,
  keyword,
  enabled = true,
}: GetOwnerPendingMembersParams & { userId?: string; enabled?: boolean } = {}) {
  const params = { sort, keyword };

  return useQuery({
    queryKey: ownerPendingMembersQueryKey(userId, params),
    queryFn: () => getOwnerPendingMembers(params),
    select: (response) => toOwnerPendingMembersResponse(response.data),
    placeholderData: keepPreviousData,
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
