import { useQuery } from '@tanstack/react-query';
import { createKindergartenNearQueryOptions } from '@entities/kindergarten';

function useKindergartenNearQuery(id: string, lng: number, lat: number) {
  return useQuery({
    ...createKindergartenNearQueryOptions(id, lng, lat),
  });
}

export { useKindergartenNearQuery };
