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
      const queryKey = userAgreementsStatusQueryKey(userId);
      // 재조회가 끝나기 전에 시트가 다시 열리지 않도록 동의 완료로 먼저 반영하고, 서버 값으로 다시 맞춘다.
      queryClient.setQueryData<ApiResponse<UserAgreementsStatus>>(queryKey, (previous) =>
        previous?.data ? { ...previous, data: { ...previous.data, hasAgreedRequiredTerms: true } } : previous
      );
      return queryClient.invalidateQueries({ queryKey });
    },
  });
}

export {
  USER_AGREEMENTS_STATUS_QUERY_KEY,
  userAgreementsStatusQueryKey,
  useUserAgreementsStatusQuery,
  usePostUserAgreementsMutation,
};
