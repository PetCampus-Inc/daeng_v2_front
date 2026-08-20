import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiResponse } from '@shared/api';

import { useUserStore } from '../model/store/useUserStore';
import {
  getUserAgreementsStatus,
  postUserAgreements,
  type CreateUserAgreementsRequest,
  type UserAgreementsStatus,
} from './userAgreement';

const USER_AGREEMENTS_STATUS_QUERY_KEY = 'userAgreementsStatus';

/** 계정 전환 시 이전 사용자의 약관 동의 상태가 재사용되지 않도록 분리한다. */
const userAgreementsStatusQueryKey = (userId?: string) =>
  [USER_AGREEMENTS_STATUS_QUERY_KEY, userId] as const;

function useUserAgreementsStatusQuery(userId?: string) {
  return useQuery({
    queryKey: userAgreementsStatusQueryKey(userId),
    queryFn: getUserAgreementsStatus,
    enabled: Boolean(userId),
    staleTime: 0,
  });
}

function usePostUserAgreementsMutation() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: (request: CreateUserAgreementsRequest) => postUserAgreements(request),
    onSuccess: () => {
      queryClient.setQueryData<ApiResponse<UserAgreementsStatus>>(
        userAgreementsStatusQueryKey(userId),
        (previous) =>
          previous
            ? { ...previous, data: { hasAgreedRequiredTerms: true } }
            : { status: 0, code: 'SUCCESS', message: '', data: { hasAgreedRequiredTerms: true } }
      );
    },
  });
}

export {
  USER_AGREEMENTS_STATUS_QUERY_KEY,
  userAgreementsStatusQueryKey,
  useUserAgreementsStatusQuery,
  usePostUserAgreementsMutation,
};
