import { getKindergartenMain } from '../api/kindergarten-main';

const kindergartenMainQueryKeys = {
  all: ['kindergarten-main'] as const,
  byId: (id: string, userId: string) => [...kindergartenMainQueryKeys.all, id, { userId }] as const,
  byLocation: (id: string, lng: number, lat: number, userId: string) =>
    [...kindergartenMainQueryKeys.byId(id, userId), { lng, lat }] as const,
} as const;

const createKindergartenMainQueryOptions = (id: string, lng: number, lat: number, userId: string) => ({
  queryKey: kindergartenMainQueryKeys.byLocation(id, lng, lat, userId),
  queryFn: () => getKindergartenMain({ id, lng, lat }),
});

export { kindergartenMainQueryKeys, createKindergartenMainQueryOptions };
