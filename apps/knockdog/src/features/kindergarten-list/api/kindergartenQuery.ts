import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { kindergartenKeys } from '../config/query-keys';
import { serializeBounds, serializeFilters } from '../lib/serialize';
import {
  type KindergartenSearchListParams,
  type KindergartenAggregationParams,
  type FilterResultCountParams,
  type FilterOption,
  getKindergartenSearchList,
  getKindergartenAggregation,
  getFilterResultCount,
  createKindergartenListWithMock,
  isValidLatLngBounds,
} from '@entities/kindergarten';
import { isValidCoord, serializeCoords } from '@shared/lib';
import type { Coord } from '@shared/types';

export type KindergartenSearchListQueryParams = {
  refPoint?: Coord;
  bounds: naver.maps.LatLngBounds | null;
  filters?: FilterOption[];
  query?: string;
} & Omit<KindergartenSearchListParams, 'refPoint' | 'bounds' | 'filters' | 'query'>;

export type KindergartenAggregationQueryParams = {
  refPoint?: Coord;
  bounds: naver.maps.LatLngBounds | null;
  filters?: FilterOption[];
  query?: string;
  enabled?: boolean;
} & Omit<KindergartenAggregationParams, 'refPoint' | 'bounds' | 'filters'>;

export type FilterResultCountQueryParams = {
  bounds?: naver.maps.Bounds;
  filters: FilterOption[];
} & Omit<FilterResultCountParams, 'bounds' | 'filters'>;

export const kindergartenQueryOptions = {
  searchList: ({ refPoint, bounds, zoomLevel, filters, query, rank }: KindergartenSearchListQueryParams) => {
    return infiniteQueryOptions({
      queryKey: kindergartenKeys.searchList({ refPoint, bounds, zoomLevel, filters, query, rank }),
      queryFn: ({ pageParam = 1 }) =>
        getKindergartenSearchList({
          refPoint: serializeCoords(refPoint, { order: 'lnglat' }),
          bounds: serializeBounds(bounds),
          zoomLevel,
          page: pageParam,
          size: 10,
          filters: serializeFilters(filters),
          query,
          rank,
        }),
      enabled: isValidCoord(refPoint) && isValidLatLngBounds(bounds) && Number.isFinite(zoomLevel) && zoomLevel > 0,
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
    enabled: additionalEnabled = true,
  }: KindergartenAggregationQueryParams) => {
    const baseEnabled =
      isValidCoord(refPoint) && isValidLatLngBounds(bounds) && Number.isFinite(zoomLevel) && zoomLevel > 0;

    return queryOptions({
      queryKey: kindergartenKeys.aggregation({ refPoint, bounds, zoomLevel, filters, query }),
      queryFn: () =>
        getKindergartenAggregation({
          refPoint: serializeCoords(refPoint),
          bounds: serializeBounds(bounds),
          zoomLevel,
          filters: serializeFilters(filters),
          query,
        }),
      enabled: baseEnabled && additionalEnabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    });
  },

  filterResultCount: ({ bounds, filters }: FilterResultCountQueryParams) => {
    return queryOptions({
      queryKey: kindergartenKeys.filterResultCount({ bounds, filters }),
      queryFn: () =>
        getFilterResultCount({
          bounds: serializeBounds(isValidLatLngBounds(bounds) ? bounds : null),
          filters: serializeFilters(filters)!,
        }),
      enabled: filters.length > 0 && isValidLatLngBounds(bounds),
    });
  },
};
