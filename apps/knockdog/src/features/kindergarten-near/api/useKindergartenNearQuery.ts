import { useQuery } from '@tanstack/react-query';
import { createKindergartenNearQueryOptions } from '@entities/kindergarten';
import { useUserStore } from '@entities/user';

function useKindergartenNearQuery(id: string, lng: number, lat: number) {
  const user = useUserStore((state) => state.user);
  const userId = user?.userId ?? 'guest';
  return useQuery({
    ...createKindergartenNearQueryOptions(id, lng, lat, userId),
  });
}

export { useKindergartenNearQuery };
