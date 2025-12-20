// FIXME: entities로 이동!

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { DEFAULT_DISTANCE } from '../config/map';
import { createKindergartenListWithMeta } from '../model/mappers';
import type { SearchState } from '../lib/searchMachine';
import { boundsSnapshotToBounds } from '../lib/bounds';
import { getKindergartenAggregation, getKindergartenSearchList, type SortType } from '@entities/kindergarten';
import type { BookmarkItem } from '@entities/bookmark';
import type { MemoItem } from '@entities/memo';
import { isValidCoord, serializeCoords } from '@shared/lib';
import { serializeBoundSnapshot } from '@entities/kindergarten/lib/serialize';
import { isValidBoundsSnapshot } from '@entities/kindergarten/lib/is';

interface SearchListQueryParams {
  state: SearchState;
  rank?: SortType;
  bookmarks?: BookmarkItem[];
  memos?: MemoItem[];
}

interface AggregationQueryParams {
  state: SearchState;
}

export const searchQueries = {
  keys: {
    all: () => ['kindergarten'] as const,
    searchList: (params: SearchListQueryParams) =>
      [
        ...searchQueries.keys.all(),
        'search-list',
        params.state.scope,
        params.state.searchedLevel,
        params.state.query,
        params.state.filters,
        serializeCoords(params.state.refPoint),
        serializeBoundSnapshot(params.state.searchBounds),
        params.rank,
      ] as const,
    aggregation: (params: AggregationQueryParams) =>
      [
        ...searchQueries.keys.all(),
        'aggregation',
        params.state.scope,
        params.state.searchedLevel,
        params.state.query,
        params.state.filters,
        serializeCoords(params.state.refPoint),
        serializeBoundSnapshot(params.state.searchBounds),
      ] as const,
  },

  /** 검색 리스트 조회 */
  searchList: (params: SearchListQueryParams) =>
    infiniteQueryOptions({
      queryKey: [...searchQueries.keys.searchList(params)],
      queryFn: ({ pageParam = 1 }) =>
        getKindergartenSearchList({
          page: pageParam,
          size: 10,
          refPoint: params.state.refPoint!,
          zoomLevel: params.state.zoom,
          filters: params.state.filters.length > 0 ? params.state.filters : undefined,
          query: params.state.query || undefined,
          rank: params.rank,
          ...buildScopeParams(params.state),
        }),
      enabled:
        isValidCoord(params.state.refPoint) &&
        Number.isFinite(params.state.zoom) &&
        params.state.zoom > 0 &&
        (params.state.scope === 'bounds' ? isValidBoundsSnapshot(params.state.searchBounds) : true),
      initialPageParam: 1,
      getNextPageParam: (lastPage: { paging: { hasNext: boolean; currentPage: number } }) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      select: (data) => ({
        pages: data.pages.map(createKindergartenListWithMeta(params.bookmarks ?? [], params.memos ?? [])),
        pageParams: data.pageParams,
      }),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }),

  /** 집계 정보 조회 */
  aggregation: (params: AggregationQueryParams) =>
    queryOptions({
      queryKey: [...searchQueries.keys.aggregation(params)],
      queryFn: () =>
        getKindergartenAggregation({
          refPoint: params.state.refPoint!,
          zoomLevel: params.state.zoom,
          filters: params.state.filters.length > 0 ? params.state.filters : undefined,
          query: params.state.query || undefined,
          ...buildScopeParams(params.state),
        }),
      enabled:
        isValidCoord(params.state.refPoint) &&
        Number.isFinite(params.state.zoom) &&
        params.state.zoom > 0 &&
        (params.state.scope === 'bounds' ? isValidBoundsSnapshot(params.state.searchBounds) : true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }),
};

const buildScopeParams = (s: SearchState) =>
  s.scope === 'nearby'
    ? { distance: DEFAULT_DISTANCE }
    : s.scope === 'bounds'
      ? { bounds: boundsSnapshotToBounds(s.searchBounds) ?? undefined }
      : {};
