import { infiniteQueryOptions } from '@tanstack/react-query';
import { dogSchoolKeys } from '../config/query-keys';
import { createDogSchoolListWithMock } from '../model/mappers';
import { DogSchoolListService } from '@entities/dog-school/api/dogschool-list-service';
import type { DogSchoolSearchListQueryParams } from '@entities/dog-school/model/dogschool-list';
import { serializeBounds, serializeCoords } from '@entities/dog-school/lib/serialize';

const getQueryConfigByZoom = (zoomLevel: number) => {
  return {
    size: zoomLevel < 14 ? 0 : 10,
  };
};

export const dogSchoolListOptions = {
  searchList: ({ refPoint, bounds, zoomLevel }: DogSchoolSearchListQueryParams) => {
    const queryConfig = getQueryConfigByZoom(zoomLevel);

    return infiniteQueryOptions({
      queryKey: dogSchoolKeys.searchList({ refPoint, bounds, zoomLevel }),
      queryFn: ({ pageParam = 0 }) =>
        DogSchoolListService.getDogSchoolSearchList({
          refPoint: serializeCoords(refPoint),
          bounds: serializeBounds(bounds),
          zoomLevel,
          page: pageParam,
          size: queryConfig.size,
        }),
      getNextPageParam: (lastPage) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      initialPageParam: 0,
      select: (data) => ({
        pages: data.pages.map(createDogSchoolListWithMock),
        pageParams: data.pageParams,
      }),
    });
  },
};
