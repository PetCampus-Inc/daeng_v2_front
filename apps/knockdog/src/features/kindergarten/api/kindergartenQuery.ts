import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { kindergartenKeys } from '../config/query-keys';
import { serializeBounds, serializeCoords, serializeFilters } from '../lib/serialize';
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
import { isValidBounds, isValidCoord } from '@shared/lib';

export type KindergartenSearchListQueryParams = {
  refPoint: { lat: number; lng: number };
  bounds: naver.maps.LatLngBounds;
  filters?: FilterOption[];
  query?: string;
} & Omit<KindergartenSearchListParams, 'refPoint' | 'bounds' | 'filters' | 'query'>;

export type KindergartenAggregationQueryParams = {
  refPoint: { lat: number; lng: number };
  bounds: naver.maps.LatLngBounds;
  filters?: FilterOption[];
  enabled?: boolean;
} & Omit<KindergartenAggregationParams, 'refPoint' | 'bounds' | 'filters'>;

export type FilterResultCountQueryParams = {
  bounds: naver.maps.LatLngBounds;
  filters: FilterOption[];
} & Omit<FilterResultCountParams, 'bounds' | 'filters'>;

export const kindergartenQueryOptions = {
  searchList: ({
    refPoint,
    bounds,
    zoomLevel,
    filters,
    query,
    rank = 'DISTANCE',
  }: KindergartenSearchListQueryParams) => {
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
      enabled: isValidCoord(refPoint) && isValidBounds(bounds) && Number.isFinite(zoomLevel) && zoomLevel > 0,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      select: (data) => ({
        pages: data.pages.map(createKindergartenListWithMock),
        pageParams: data.pageParams,
      }),
    });
  },

  aggregation: ({
    refPoint,
    bounds,
    zoomLevel,
    filters,
    enabled: additionalEnabled = true,
  }: KindergartenAggregationQueryParams) => {
    const baseEnabled = isValidCoord(refPoint) && isValidBounds(bounds) && Number.isFinite(zoomLevel) && zoomLevel > 0;

    return queryOptions({
      queryKey: kindergartenKeys.aggregation({ refPoint, bounds, zoomLevel, filters }),
      queryFn: () =>
        getKindergartenAggregation({
          refPoint: serializeCoords(refPoint),
          bounds: serializeBounds(bounds),
          zoomLevel,
          filters: serializeFilters(filters),
        }),
      enabled: baseEnabled && additionalEnabled,
    });
  },

  filterResultCount: ({ bounds, filters }: FilterResultCountQueryParams) => {
    return queryOptions({
      queryKey: kindergartenKeys.filterResultCount({ bounds, filters }),
      queryFn: () => getFilterResultCount({ bounds: serializeBounds(bounds), filters: serializeFilters(filters)! }),
      enabled: filters.length > 0 && isValidBounds(bounds),
    });
  },
};
