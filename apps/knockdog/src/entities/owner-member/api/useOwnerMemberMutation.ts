import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@shared/api';
import {
  postApproveOwnerMember,
  postDisconnectOwnerMember,
  postRejectOwnerMember,
} from './ownerMember';
import { ownerMembersQueryKey, ownerPendingMembersQueryKey } from './useOwnerMemberQuery';

/** 이미 보호자가 취소한 연결 신청을 승인/거절하려 할 때 백엔드가 내려주는 코드 */
const ALREADY_CANCELLED_CODE = 'OWNER_MEMBER-409-2';

function isAlreadyCancelledError(error: unknown): boolean {
  return error instanceof ApiError && String(error.code) === ALREADY_CANCELLED_CODE;
}

interface UseOwnerMemberApprovalMutationOptions {
  userId?: string;
}

function useOwnerMemberApprovalMutation({ userId }: UseOwnerMemberApprovalMutationOptions = {}) {
  const queryClient = useQueryClient();

  const invalidateOwnerMembers = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ownerPendingMembersQueryKey(userId) }),
      queryClient.invalidateQueries({ queryKey: ownerMembersQueryKey(userId) }),
    ]);
  };

  // 이미 취소된 신청은 목록에서 사라져야 하므로, 실패해도 pending 목록을 갱신해 stale 항목을 지운다
  const invalidateIfAlreadyCancelled = (error: unknown) => {
    if (isAlreadyCancelledError(error)) void invalidateOwnerMembers();
  };

  return {
    approveMutation: useMutation({
      mutationFn: postApproveOwnerMember,
      onSuccess: invalidateOwnerMembers,
      onError: invalidateIfAlreadyCancelled,
    }),
    rejectMutation: useMutation({
      mutationFn: postRejectOwnerMember,
      onSuccess: invalidateOwnerMembers,
      onError: invalidateIfAlreadyCancelled,
    }),
  };
}

function useOwnerMemberDisconnectMutation({ userId }: UseOwnerMemberApprovalMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postDisconnectOwnerMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ownerMembersQueryKey(userId) });
    },
  });
}

export { useOwnerMemberApprovalMutation, useOwnerMemberDisconnectMutation, isAlreadyCancelledError };
