import { useQuery } from '@tanstack/react-query';
import { type KindergartenMainParams, kindergartenQueries, toKindergartenMain } from '@entities/kindergarten';
import { useUserStore } from '@entities/user';

export function useKindergartenMainQuery(params: KindergartenMainParams) {
  const { id, lng, lat } = params;
  const user = useUserStore((state) => state.user);
  const userId = user?.userId ?? 'guest';

  return useQuery({
    ...kindergartenQueries.main({ id, lng, lat, userId }),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    select: toKindergartenMain,
    enabled: Boolean(id && lng != null && lat != null),
  });
}
