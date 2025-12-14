import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { DEFAULT_DISTANCE } from '../config/map';
import { createKindergartenListWithMeta } from '../model/mappers';
import {
  getKindergartenAggregation,
  getKindergartenSearchList,
  isValidBounds,
  serializeBounds,
  type FilterOption,
  type SortType,
} from '@entities/kindergarten';
import type { BookmarkItem } from '@entities/bookmark';
import { isValidCoord, serializeCoords } from '@shared/lib';
import type { Bounds, Coord } from '@shared/types';

interface SearchSnapshot {
  scope: 'nearby' | 'global' | 'bounds';
  searchedLevel: 1 | 2 | 3;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: Bounds | null;
  searchLock: 0 | 1;
}

interface MapSnapshot {
  center: Coord | null;
  zoom: number;
}

interface SearchListQueryParams {
  snapshot: SearchSnapshot;
  mapSnapshot: MapSnapshot;
  rank?: SortType;
  bookmarks: BookmarkItem[];
}

interface AggregationQueryParams {
  snapshot: SearchSnapshot;
  mapSnapshot: MapSnapshot;
}

export const searchQueries = {
  keys: {
    all: () => ['kindergarten'] as const,
    searchList: (params: SearchListQueryParams) =>
      [
        ...searchQueries.keys.all(),
        'search-list',
        params.snapshot.scope,
        params.snapshot.searchedLevel,
        params.snapshot.query,
        params.snapshot.filters,
        serializeCoords(params.snapshot.refPoint),
        serializeBounds(params.snapshot.searchBounds),
        params.rank,
      ] as const,
    aggregation: (params: AggregationQueryParams) =>
      [
        ...searchQueries.keys.all(),
        'aggregation',
        params.snapshot.scope,
        params.snapshot.searchedLevel,
        params.snapshot.query,
        params.snapshot.filters,
        serializeCoords(params.snapshot.refPoint),
        serializeBounds(params.snapshot.searchBounds),
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
          refPoint: params.snapshot.refPoint!,
          zoomLevel: params.mapSnapshot.zoom,
          filters: params.snapshot.filters.length > 0 ? params.snapshot.filters : undefined,
          query: params.snapshot.query || undefined,
          rank: params.rank,
          ...buildScopeParams(params.snapshot),
        }),
      enabled:
        isValidCoord(params.snapshot.refPoint) &&
        Number.isFinite(params.mapSnapshot.zoom) &&
        params.mapSnapshot.zoom > 0 &&
        (params.snapshot.scope === 'bounds' ? isValidBounds(params.snapshot.searchBounds) : true),
      initialPageParam: 1,
      getNextPageParam: (lastPage: { paging: { hasNext: boolean; currentPage: number } }) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      select: (data) => ({
        pages: data.pages.map(createKindergartenListWithMeta(params.bookmarks ?? [])),
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
          refPoint: params.snapshot.refPoint!,
          zoomLevel: params.mapSnapshot.zoom,
          filters: params.snapshot.filters.length > 0 ? params.snapshot.filters : undefined,
          query: params.snapshot.query || undefined,
          ...buildScopeParams(params.snapshot),
        }),
      enabled:
        isValidCoord(params.snapshot.refPoint) &&
        Number.isFinite(params.mapSnapshot.zoom) &&
        params.mapSnapshot.zoom > 0 &&
        (params.snapshot.scope === 'bounds' ? isValidBounds(params.snapshot.searchBounds) : true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }),
};

const buildScopeParams = (s: SearchSnapshot) =>
  s.scope === 'nearby'
    ? { distance: DEFAULT_DISTANCE }
    : s.scope === 'bounds'
      ? { bounds: s.searchBounds ?? undefined }
      : {};
