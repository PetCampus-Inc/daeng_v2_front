import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

const getQueryConfigByZoom = (zoomLevel: number) => {
  return {
    size: zoomLevel < 14 ? 0 : 10,
  };
};

export function useKindergartenSearchListQuery({
  refPoint,
  bounds,
  zoomLevel,
  filters,
}: KindergartenSearchListQueryParams) {
  const queryConfig = getQueryConfigByZoom(zoomLevel);

  return useInfiniteQuery({
    queryKey: kindergartenKeys.searchList({ refPoint, bounds, zoomLevel }),
    queryFn: ({ pageParam = 1 }) =>
      getKindergartenSearchList({
        refPoint: serializeCoords(refPoint),
        bounds: serializeBounds(bounds),
        zoomLevel,
        page: pageParam,
        size: queryConfig.size,
        filters,
      }),
    enabled: isValidCoord(refPoint) && isValidBounds(bounds) && Boolean(zoomLevel),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map(createDogSchoolListWithMock),
      pageParams: data.pageParams,
    }),
  });
}

export type KindergartenAggregationQueryParams = {
  refPoint: { lat: number; lng: number };
  bounds: naver.maps.LatLngBounds;
  zoomLevel: number;
  filters?: FilterOption;
};

export function useKindergartenAggregationQuery({
  refPoint,
  bounds,
  zoomLevel,
  filters,
}: KindergartenAggregationQueryParams) {
  return useQuery({
    queryKey: kindergartenKeys.aggregation({ refPoint, bounds, zoomLevel, filters }),
    queryFn: () =>
      getKindergartenAggregation({
        refPoint: serializeCoords(refPoint),
        bounds: serializeBounds(bounds),
        zoomLevel,
        filters,
      }),
  });
}
