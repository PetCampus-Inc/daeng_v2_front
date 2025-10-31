import { createKindergartenMainQueryOptions } from '@entities/kindergarten';
import { useQuery } from '@tanstack/react-query';

interface KindergartenMainQueryParams {
  id: string;
  lng: number;
  lat: number;
  enabled?: boolean;
}

function useKindergartenMainQuery(params: KindergartenMainQueryParams) {
  const { id, lng, lat, enabled } = params;
  return useQuery({
    ...createKindergartenMainQueryOptions(id, lng, lat),
    enabled: enabled ?? true,
  });
}

export { useKindergartenMainQuery };
