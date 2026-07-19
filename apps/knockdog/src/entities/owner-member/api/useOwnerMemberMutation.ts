import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  postApproveOwnerMember,
  postDisconnectOwnerMember,
  postRejectOwnerMember,
} from './ownerMember';
import { ownerMembersQueryKey, ownerPendingMembersQueryKey } from './useOwnerMemberQuery';

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

  return {
    approveMutation: useMutation({
      mutationFn: postApproveOwnerMember,
      onSuccess: invalidateOwnerMembers,
    }),
    rejectMutation: useMutation({
      mutationFn: postRejectOwnerMember,
      onSuccess: invalidateOwnerMembers,
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

export { useOwnerMemberApprovalMutation, useOwnerMemberDisconnectMutation };
