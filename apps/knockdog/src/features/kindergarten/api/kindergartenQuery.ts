import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { kindergartenKeys } from '../config/query-keys';
import { createDogSchoolListWithMock } from '../model/mappers';
import { serializeBounds, serializeCoords } from '../lib/serialize';
import { type FilterOption, getKindergartenSearchList, getKindergartenAggregation } from '@entities/kindergarten';
import { isValidBounds, isValidCoord } from '@shared/lib';

export type KindergartenSearchListQueryParams = {
  refPoint: { lat: number; lng: number };
  bounds: naver.maps.LatLngBounds;
  zoomLevel: number;
  page?: number;
  size?: number;
  filters?: FilterOption;
  rank?: 'DISTANCE' | 'REVIEW';
};

export type KindergartenAggregationQueryParams = {
  refPoint: { lat: number; lng: number };
  bounds: naver.maps.LatLngBounds;
  zoomLevel: number;
  filters?: FilterOption;
  enabled?: boolean;
};

export const kindergartenQueryOptions = {
  searchList: ({ refPoint, bounds, zoomLevel, filters }: KindergartenSearchListQueryParams) => {
    return infiniteQueryOptions({
      queryKey: kindergartenKeys.searchList({ refPoint, bounds, zoomLevel }),
      queryFn: ({ pageParam = 1 }) =>
        getKindergartenSearchList({
          refPoint: serializeCoords(refPoint),
          bounds: serializeBounds(bounds),
          zoomLevel,
          page: pageParam,
          size: 10,
          filters,
        }),
      enabled: isValidCoord(refPoint) && isValidBounds(bounds) && Number.isFinite(zoomLevel) && zoomLevel > 0,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      select: (data) => ({
        pages: data.pages.map(createDogSchoolListWithMock),
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
          filters,
        }),
      enabled: baseEnabled && additionalEnabled,
    });
  },
};
