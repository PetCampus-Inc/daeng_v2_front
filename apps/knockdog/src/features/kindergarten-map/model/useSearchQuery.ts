import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchMachine } from './useSearchMachine';
import { boundsSnapshotToBounds } from '../lib/bounds';
import { bookmarkQueries } from '../api/bookmarkQueries';
import { searchQueries } from '../api/searchQueries';
import { useUserStore } from '@entities/user';
import type {
  Aggregation,
  KindergartenListItemWithMeta,
  KindergartenListWithMeta,
  SortType,
  SidoGunguAggregation,
} from '@entities/kindergarten';
import { tokenUtils } from '@shared/utils';

interface UseSearchListQueryParams {
  rank?: SortType;
}

export function useSearchListQuery({ rank }: UseSearchListQueryParams = {}) {
  const { snapshot, mapSnapshot } = useSearchMachine();
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const bookmarksQuery = useQuery(bookmarkQueries.list(isLoggedIn));

  const searchListOptions = searchQueries.searchList({
    snapshot: {
      ...snapshot,
      searchBounds: boundsSnapshotToBounds(snapshot.searchBounds),
    },
    mapSnapshot,
    rank,
    bookmarks: isLoggedIn ? (bookmarksQuery.data ?? []) : [],
  });
  const canFetchList = searchListOptions.enabled && (isLoggedIn ? !bookmarksQuery.isLoading : true);

  const searchListQuery = useInfiniteQuery({
    ...searchListOptions,
    enabled: canFetchList,
  });

  const listData = searchListQuery.data as InfiniteData<KindergartenListWithMeta> | undefined;

  const { searchList, exact, listWithoutExact } = useMemo(() => {
    if (!listData) {
      return {
        searchList: [] as KindergartenListItemWithMeta[],
        exact: null,
        listWithoutExact: [] as KindergartenListItemWithMeta[],
      };
    }
    const allList = listData.pages.flatMap((page) => page.schoolResult.list);
    const pageWithExact = listData.pages.find((page) => page.schoolResult.exact);
    const exactItem = pageWithExact?.schoolResult.exact ?? null;
    const listExceptExact = exactItem ? allList.filter((item) => item.id !== exactItem.id) : allList;
    return { searchList: allList, exact: exactItem, listWithoutExact: listExceptExact };
  }, [listData]);

  return {
    listQuery: searchListQuery,
    searchListQueryKey: searchListOptions.queryKey,
    searchList,
    listWithoutExact,
    exact,
    isLoading: searchListQuery.isLoading,
    isFetching: searchListQuery.isFetching,
  };
}

export function useAggregationQuery() {
  const { snapshot, mapSnapshot } = useSearchMachine();

  const aggregationOptions = searchQueries.aggregation({
    snapshot: {
      ...snapshot,
      searchBounds: boundsSnapshotToBounds(snapshot.searchBounds),
    },
    mapSnapshot,
  });
  const canFetchAgg = aggregationOptions.enabled;

  const aggregationQuery = useQuery({
    ...aggregationOptions,
    enabled: canFetchAgg,
  });

  const aggData = aggregationQuery.data as Aggregation | undefined;

  const aggregation = useMemo<SidoGunguAggregation[]>(() => {
    if (!aggData?.aggregations) return [];
    const { sidoAggregations, sigunAggregations } = aggData.aggregations;
    return sigunAggregations || sidoAggregations || [];
  }, [aggData]);

  const geoBounds = useMemo(() => {
    return aggData?.bounds || null;
  }, [aggData]);

  return {
    aggregation,
    geoBounds,
    isLoading: aggregationQuery.isLoading,
    isFetching: aggregationQuery.isFetching,
  };
}
