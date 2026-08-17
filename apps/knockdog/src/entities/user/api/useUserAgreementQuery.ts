import { useQuery } from '@tanstack/react-query';

import { getUserAgreementsStatus } from './userAgreement';

const USER_AGREEMENTS_STATUS_QUERY_KEY = 'userAgreementsStatus';

/** 계정 전환 시 이전 사용자의 약관 동의 상태가 재사용되지 않도록 분리한다. */
const userAgreementsStatusQueryKey = (userId?: string) =>
  [USER_AGREEMENTS_STATUS_QUERY_KEY, userId] as const;

function useUserAgreementsStatusQuery(userId?: string) {
  return useQuery({
    queryKey: userAgreementsStatusQueryKey(userId),
    queryFn: getUserAgreementsStatus,
    enabled: Boolean(userId),
  });
}

export {
  USER_AGREEMENTS_STATUS_QUERY_KEY,
  userAgreementsStatusQueryKey,
  useUserAgreementsStatusQuery,
};
