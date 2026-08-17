import { useQuery } from '@tanstack/react-query';

import { getUserAgreementsStatus } from './userAgreement';

const USER_AGREEMENTS_STATUS_QUERY_KEY = 'userAgreementsStatus';

function useUserAgreementsStatusQuery() {
  return useQuery({
    queryKey: [USER_AGREEMENTS_STATUS_QUERY_KEY],
    queryFn: getUserAgreementsStatus,
  });
}

export { USER_AGREEMENTS_STATUS_QUERY_KEY, useUserAgreementsStatusQuery };
