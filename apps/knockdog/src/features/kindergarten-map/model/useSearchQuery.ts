import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchMachine } from './useSearchMachine';

import { searchQueries } from '../api/searchQueries';
import { useListOptionsUrlState } from '@features/kindergarten-list';
import { useUserStore } from '@entities/user';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { bookmarkQueries } from '@entities/bookmark';
import { tokenUtils } from '@shared/utils';
import { memoQueries } from '@entities/memo';

export function useSearchListQuery() {
  const { committedState } = useSearchMachine();
  const { rank } = useListOptionsUrlState();
  const user = useUserStore((s) => s.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const bookmarksQuery = useQuery({
    ...bookmarkQueries.list(),
    enabled: isLoggedIn,
  });

  const memoListQuery = useQuery({
    ...memoQueries.list(),
    enabled: isLoggedIn,
  });

  const searchListOptions = searchQueries.searchList({
    state: committedState,
    rank,
    bookmarks: isLoggedIn ? bookmarksQuery.data : [],
    memos: isLoggedIn ? memoListQuery.data?.memos : [],
  });

  const searchListQuery = useInfiniteQuery({
    ...searchListOptions,
    enabled: searchListOptions.enabled && (isLoggedIn ? !bookmarksQuery.isLoading : true),
    placeholderData: keepPreviousData,
  });

  const listData = searchListQuery.data;

  const { searchList, exact } = useMemo(() => {
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
    return { searchList: allList, exact: exactItem };
  }, [listData]);

  return {
    listQuery: searchListQuery,
    searchListQueryKey: searchListOptions.queryKey,
    searchList,
    exact,
    isLoading: searchListQuery.isLoading,
    isFetching: searchListQuery.isFetching,
  };
}

export function useAggregationQuery() {
  const { committedState } = useSearchMachine();

  const { data, isLoading, isFetching } = useQuery(searchQueries.aggregation({ state: committedState }));

  const aggregation = useMemo(() => {
    if (!data?.aggregations) return [];
    const { sidoAggregations, sigunAggregations } = data.aggregations;
    return sigunAggregations || sidoAggregations || [];
  }, [data]);

  const geoBounds = useMemo(() => {
    return data?.bounds || null;
  }, [data]);

  return {
    aggregation,
    geoBounds,
    isLoading,
    isFetching,
  };
}
