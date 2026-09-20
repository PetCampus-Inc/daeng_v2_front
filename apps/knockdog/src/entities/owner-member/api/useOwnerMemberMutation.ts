import { useMutation, useQueryClient } from '@tanstack/react-query';

import { NOTIFICATIONS_QUERY_KEY } from '@entities/notification';
import {
  OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY,
  OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY,
  OWNER_ATTENDANCE_CHECKINOUT_TODAY_QUERY_KEY,
} from '@entities/owner-attendance-checkinout';
import { OWNER_HOME_QUERY_KEY } from '@entities/owner-home';
import { OWNER_PET_GUARDIAN_QUERY_KEY, OWNER_PET_QUERY_KEY } from '@entities/owner-pet';
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

/**
 * 원장 구성원 연결 해제.
 * 성공 시 구성원/일과 목록·홈·알림함·원생 프로필 캐시를 갱신한다.
 * (당일 등원 원생 일과 노출 등은 서버 정책 — KD3-439)
 * 보호자 푸시/알림함 발송은 disconnect API 성공 시 서버 책임.
 */
function useOwnerMemberDisconnectMutation({ userId }: UseOwnerMemberApprovalMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postDisconnectOwnerMember,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerMembersQueryKey(userId) }),
        queryClient.invalidateQueries({
          queryKey: [OWNER_ATTENDANCE_CHECKINOUT_CANDIDATES_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [OWNER_ATTENDANCE_CHECKINOUT_TODAY_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [OWNER_ATTENDANCE_CHECKINOUT_SUMMARY_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({ queryKey: [OWNER_HOME_QUERY_KEY, userId] }),
        queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [OWNER_PET_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [OWNER_PET_GUARDIAN_QUERY_KEY] }),
      ]);
    },
  });
}

export { useOwnerMemberApprovalMutation, useOwnerMemberDisconnectMutation, isAlreadyCancelledError };
