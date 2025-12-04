import { createKindergartenMainQueryOptions } from '@entities/kindergarten';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@entities/user';

interface KindergartenMainQueryParams {
  id: string;
  lng: number;
  lat: number;
  enabled?: boolean;
}

function useKindergartenMainQuery(params: KindergartenMainQueryParams) {
  const { id, lng, lat, enabled } = params;
  const user = useUserStore((state) => state.user);
  const userId = user?.userId ?? 'guest';
  return useQuery({
    ...createKindergartenMainQueryOptions(id, lng, lat, userId),
    enabled: enabled ?? true,
  });
}

export { useKindergartenMainQuery };
