import { getKindergartenNearList } from '../api/kindergarten-near';

const kindergartenNearQueryKeys = {
  all: ['kindergarten-near'] as const,
  byId: (id: string, userId: string) => [...kindergartenNearQueryKeys.all, id, { userId }] as const,
  byLocation: (id: string, lng: number, lat: number, userId: string) =>
    [...kindergartenNearQueryKeys.byId(id, userId), { lng, lat }] as const,
} as const;

const createKindergartenNearQueryOptions = (id: string, lng: number, lat: number, userId: string) => ({
  queryKey: kindergartenNearQueryKeys.byLocation(id, lng, lat, userId),
  queryFn: () => getKindergartenNearList({ id, lng, lat }),
});

export { kindergartenNearQueryKeys, createKindergartenNearQueryOptions };
