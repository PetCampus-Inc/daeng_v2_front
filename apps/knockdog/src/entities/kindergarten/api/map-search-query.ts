import { infiniteQueryOptions, queryOptions, type InfiniteData } from '@tanstack/react-query';
import { getKindergartenAggregation, getKindergartenSearchList, type SortType } from './search-list';
import type { FilterOption } from '../config/filter-options';
import { createKindergartenListWithMock } from '../model/mappers';
import { serializeBounds } from '../lib/serialize';
import { isValidBounds } from '../lib/is';
import { getFilterResultCount } from './filters';
import type { KindergartenSearchList } from '../model/search-list';
import type { Bounds, Coord } from '@shared/types';
import { serializeCoords, isValidCoord } from '@shared/lib';

const DEFAULT_DISTANCE = 1;

export interface KindergartenSearchSnapshotLike {
  scope: 'nearby' | 'global' | 'bounds';
  searchedLevel: 1 | 2 | 3;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: Bounds | null;
  searchLock: 0 | 1;
}

export interface KindergartenMapSnapshotLike {
  center: Coord | null;
  zoom: number;
}

export interface KindergartenSearchListQueryParams {
  snapshot: KindergartenSearchSnapshotLike;
  mapSnapshot: KindergartenMapSnapshotLike;
  rank?: SortType;
}

export interface KindergartenAggregationQueryParams {
  snapshot: KindergartenSearchSnapshotLike;
  mapSnapshot: KindergartenMapSnapshotLike;
}

export interface FilterResultCountQueryParams {
  bounds: Bounds | null;
  filters: FilterOption[];
}

export const kindergartenMapQueryKeys = {
  root: ['kindergarten'] as const,
  searchList: (snapshot: KindergartenSearchSnapshotLike, rank?: SortType) => [
    ...kindergartenMapQueryKeys.root,
    'search-list',
    snapshot.scope,
    snapshot.searchedLevel,
    snapshot.query,
    snapshot.filters,
    serializeCoords(snapshot.refPoint),
    serializeBounds(snapshot.searchBounds),
    rank,
  ],
  aggregation: (snapshot: KindergartenSearchSnapshotLike) => [
    ...kindergartenMapQueryKeys.root,
    'aggregation',
    snapshot.scope,
    snapshot.searchedLevel,
    snapshot.query,
    snapshot.filters,
    serializeCoords(snapshot.refPoint),
    serializeBounds(snapshot.searchBounds),
  ],
  filterResultCount: (params: FilterResultCountQueryParams) => [
    ...kindergartenMapQueryKeys.root,
    'filter-result-count',
    serializeBounds(params.bounds),
    params.filters,
  ],
};

const buildSearchListParams = ({ snapshot, mapSnapshot, rank }: KindergartenSearchListQueryParams) => ({
  queryKey: kindergartenMapQueryKeys.searchList(snapshot, rank),
  queryFn: ({ pageParam = 1 }) =>
    getKindergartenSearchList({
      refPoint: snapshot.refPoint!,
      zoomLevel: mapSnapshot.zoom,
      page: pageParam,
      size: 10,
      filters: snapshot.filters.length > 0 ? snapshot.filters : undefined,
      query: snapshot.query || undefined,
      rank,
      ...(snapshot.scope === 'nearby'
        ? { distance: DEFAULT_DISTANCE }
        : snapshot.scope === 'bounds'
          ? { bounds: snapshot.searchBounds ?? undefined }
          : {}),
    }),
  enabled:
    isValidCoord(snapshot.refPoint) &&
    Number.isFinite(mapSnapshot.zoom) &&
    mapSnapshot.zoom > 0 &&
    (snapshot.scope === 'bounds' ? isValidBounds(snapshot.searchBounds) : true),
  initialPageParam: 1,
  getNextPageParam: (lastPage: { paging: { hasNext: boolean; currentPage: number } }) => {
    return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
  },
  select: (data: InfiniteData<KindergartenSearchList>) => ({
    pages: data.pages.map(createKindergartenListWithMock),
    pageParams: data.pageParams,
  }),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retryOnMount: false,
  refetchOnWindowFocus: false,
});

export const kindergartenQueryOptions = {
  searchList: (params: KindergartenSearchListQueryParams) => infiniteQueryOptions(buildSearchListParams(params)),

  aggregation: ({ snapshot, mapSnapshot }: KindergartenAggregationQueryParams) =>
    queryOptions({
      queryKey: kindergartenMapQueryKeys.aggregation(snapshot),
      queryFn: () =>
        getKindergartenAggregation({
          refPoint: snapshot.refPoint!,
          zoomLevel: mapSnapshot.zoom,
          filters: snapshot.filters.length > 0 ? snapshot.filters : undefined,
          query: snapshot.query || undefined,
          ...(snapshot.scope === 'nearby'
            ? { distance: DEFAULT_DISTANCE }
            : snapshot.scope === 'bounds'
              ? { bounds: snapshot.searchBounds ?? undefined }
              : {}),
        }),
      enabled:
        isValidCoord(snapshot.refPoint) &&
        Number.isFinite(mapSnapshot.zoom) &&
        mapSnapshot.zoom > 0 &&
        (snapshot.scope === 'bounds' ? isValidBounds(snapshot.searchBounds) : true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }),

  filterResultCount: ({ bounds, filters }: FilterResultCountQueryParams) =>
    queryOptions({
      queryKey: kindergartenMapQueryKeys.filterResultCount({ bounds, filters }),
      queryFn: () =>
        getFilterResultCount({
          bounds,
          filters,
        }),
      enabled: filters.length > 0 && isValidBounds(bounds),
    }),
};
