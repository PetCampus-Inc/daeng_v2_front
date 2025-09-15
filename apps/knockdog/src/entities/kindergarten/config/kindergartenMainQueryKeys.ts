import { getKindergartenMain } from '../api/kindergarten-main';

const kindergartenMainQueryKeys = {
  all: ['kindergarten-main'] as const,
  byId: (id: string) => [...kindergartenMainQueryKeys.all, id] as const,
} as const;

const createKindergartenMainQueryOptions = (id: string, lng: number, lat: number) => ({
  queryKey: kindergartenMainQueryKeys.byId(id),
  queryFn: () => getKindergartenMain({ id, lng, lat }),
});

export { kindergartenMainQueryKeys, createKindergartenMainQueryOptions };
