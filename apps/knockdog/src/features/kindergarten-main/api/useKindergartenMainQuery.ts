import { createKindergartenMainQueryOptions } from '@entities/kindergarten';
import { useQuery } from '@tanstack/react-query';

function useKindergartenMainQuery(id: string, lng: number, lat: number) {
  return useQuery({
    ...createKindergartenMainQueryOptions(id, lng, lat),
  });
}

export { useKindergartenMainQuery };
