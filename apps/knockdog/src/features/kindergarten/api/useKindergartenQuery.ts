import { useInfiniteQuery } from '@tanstack/react-query';
import { kindergartenKeys } from '../config/query-keys';
import { createDogSchoolListWithMock } from '../model/mappers';
import { serializeBounds, serializeCoords } from '../lib/serialize';
import { getKindergartenSearchList } from '@entities/kindergarten';
import { isValidBounds, isValidCoord } from '@shared/lib';

export type KindergartenSearchListQueryParams = {
  refPoint: { lat: number; lng: number };
  bounds: naver.maps.LatLngBounds;
  zoomLevel: number;
  page?: number;
  size?: number;
};

const getQueryConfigByZoom = (zoomLevel: number) => {
  return {
    size: zoomLevel < 14 ? 0 : 10,
  };
};

export function useKindergartenSearchListQuery({ refPoint, bounds, zoomLevel }: KindergartenSearchListQueryParams) {
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
