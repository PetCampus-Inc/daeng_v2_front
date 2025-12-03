import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { kindergartenKeys } from '../config/query-keys';
import { isValidLatLngBounds, toBounds } from '../lib/map-adapter';
import { DEFAULT_DISTANCE } from '../config/constants';
// FIXME: fsd rule 위반...
import type { SearchMode } from '@features/kindergarten-map';
import {
  type KindergartenSearchListParams,
  type KindergartenAggregationParams,
  type FilterResultCountParams,
  type FilterOption,
  getKindergartenSearchList,
  getKindergartenAggregation,
  getFilterResultCount,
  createKindergartenListWithMock,
} from '@entities/kindergarten';
import { isValidCoord } from '@shared/lib';
import type { Coord } from '@shared/types';

export type KindergartenSearchListQueryParams = {
  refPoint?: Coord;
  bounds?: naver.maps.LatLngBounds | null;
  filters?: FilterOption[];
  query?: string;
  searchMode?: SearchMode;
} & Omit<KindergartenSearchListParams, 'refPoint' | 'bounds' | 'filters' | 'query'>;

export type KindergartenAggregationQueryParams = {
  refPoint?: Coord;
  bounds: naver.maps.LatLngBounds | null;
  filters?: FilterOption[];
  query?: string;
  searchMode?: SearchMode;
} & Omit<KindergartenAggregationParams, 'refPoint' | 'bounds' | 'filters'>;

export type FilterResultCountQueryParams = {
  bounds?: naver.maps.Bounds;
  filters: FilterOption[];
} & Omit<FilterResultCountParams, 'bounds' | 'filters'>;

export const kindergartenQueryOptions = {
  searchList: ({
    refPoint,
    bounds,
    zoomLevel,
    filters,
    query,
    rank,
    searchMode = 'nearby',
  }: KindergartenSearchListQueryParams) => {
    const isNearbyMode = searchMode === 'nearby';

    return infiniteQueryOptions({
      queryKey: kindergartenKeys.searchList({ refPoint, bounds, zoomLevel, filters, query, rank, searchMode }),
      queryFn: ({ pageParam = 1 }) =>
        getKindergartenSearchList({
          refPoint: refPoint!,
          zoomLevel,
          page: pageParam,
          size: 10,
          filters,
          query,
          rank,
          ...(isNearbyMode ? { distance: DEFAULT_DISTANCE } : { bounds: toBounds(bounds) }),
        }),
      enabled:
        isValidCoord(refPoint) &&
        Number.isFinite(zoomLevel) &&
        zoomLevel > 0 &&
        (!isNearbyMode ? isValidLatLngBounds(bounds) : true),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      select: (data) => ({
        pages: data.pages.map(createKindergartenListWithMock),
        pageParams: data.pageParams,
      }),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    });
  },

  aggregation: ({
    refPoint,
    bounds,
    zoomLevel,
    filters,
    query,
    searchMode = 'nearby',
  }: KindergartenAggregationQueryParams) => {
    const isNearbyMode = searchMode === 'nearby';

    return queryOptions({
      queryKey: kindergartenKeys.aggregation({ refPoint, bounds, zoomLevel, filters, query, searchMode }),
      queryFn: () =>
        getKindergartenAggregation({
          refPoint: refPoint!,
          zoomLevel,
          filters,
          query,
          ...(isNearbyMode ? { distance: DEFAULT_DISTANCE } : { bounds: toBounds(bounds) }),
        }),
      enabled:
        isValidCoord(refPoint) &&
        Number.isFinite(zoomLevel) &&
        zoomLevel > 0 &&
        (!isNearbyMode ? isValidLatLngBounds(bounds) : true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    });
  },

  filterResultCount: ({ bounds, filters }: FilterResultCountQueryParams) => {
    const abstractBounds = bounds ? toBounds(isValidLatLngBounds(bounds) ? bounds : null) : null;
    return queryOptions({
      queryKey: kindergartenKeys.filterResultCount({ bounds, filters }),
      queryFn: () =>
        getFilterResultCount({
          bounds: abstractBounds,
          filters,
        }),
      enabled: filters.length > 0 && bounds !== undefined && isValidLatLngBounds(bounds),
    });
  },
};
