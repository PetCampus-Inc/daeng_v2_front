import { useQuery } from '@tanstack/react-query';

import { createKindergartenBasicQueryOptions } from '@entities/kindergarten';

function useKindergartenBasicQuery(id: string) {
  return useQuery({
    ...createKindergartenBasicQueryOptions(id),
  });
}

export { useKindergartenBasicQuery };
