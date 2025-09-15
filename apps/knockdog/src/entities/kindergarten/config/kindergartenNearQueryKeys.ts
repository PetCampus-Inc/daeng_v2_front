import { getKindergartenNearList } from '../api/kindergarten-near';

const kindergartenNearQueryKeys = {
  all: ['kindergarten-near'] as const,
} as const;

const createKindergartenNearQueryOptions = (id: string, lng: number, lat: number) => ({
  queryKey: kindergartenNearQueryKeys.all,
  queryFn: () => getKindergartenNearList({ id, lng, lat }),
});

export { kindergartenNearQueryKeys, createKindergartenNearQueryOptions };
