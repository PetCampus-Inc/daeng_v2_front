import { getKindergartenBasic } from '../api/kindergarten-basic';

const kindergartenBasicQueryKeys = {
  all: ['kindergarten-basic'] as const,
  byId: (id: string) => [...kindergartenBasicQueryKeys.all, id] as const,
} as const;

const createKindergartenBasicQueryOptions = (id: string) => ({
  queryKey: kindergartenBasicQueryKeys.byId(id),
  queryFn: () => getKindergartenBasic(id),
});

export { kindergartenBasicQueryKeys, createKindergartenBasicQueryOptions };
