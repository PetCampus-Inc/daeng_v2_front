import { useQuery } from '@tanstack/react-query';
import { type KindergartenMainParams, kindergartenQueries, toKindergartenMain } from '@entities/kindergarten';
import { useUserStore } from '@entities/user';
import { bookmarkQueries } from '@entities/bookmark';
import { memoQueries } from '@entities/memo';
import { tokenUtils } from '@shared/utils';

export function useKindergartenMainQuery(params: KindergartenMainParams) {
  const { id, lng, lat } = params;
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const bookmarksQuery = useQuery({
    ...bookmarkQueries.list(),
    enabled: isLoggedIn,
  });

  const memoListQuery = useQuery({
    ...memoQueries.list(),
    enabled: isLoggedIn,
  });

  return useQuery({
    ...kindergartenQueries.main({ id, lng, lat }),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    select: (data) =>
      toKindergartenMain({
        item: data,
        memo: memoListQuery.data?.memos ?? [],
        bookmark: bookmarksQuery.data ?? [],
      }),
    enabled: Boolean(id && lng != null && lat != null),
  });
}
