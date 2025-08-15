import { infiniteQueryOptions } from '@tanstack/react-query';
import { dogSchoolKeys } from '../config/query-keys';
import { createDogSchoolListWithMock } from '../model/mappers';
import { DogSchoolListService } from '@entities/dog-school/api/dogschool-list-service';
import type { DogSchoolSearchListQueryParams } from '@entities/dog-school/model/dogschool-list';
import { serializeBounds, serializeCoords } from '@entities/dog-school/lib/serialize';

export const dogSchoolListOptions = {
  searchList: ({ refPoint, bounds, zoomLevel }: DogSchoolSearchListQueryParams) =>
    infiniteQueryOptions({
      queryKey: dogSchoolKeys.searchList({ refPoint, bounds, zoomLevel }),
      queryFn: ({ pageParam = 0 }) =>
        DogSchoolListService.getDogSchoolSearchList({
          refPoint: serializeCoords(refPoint),
          bounds: serializeBounds(bounds),
          zoomLevel: zoomLevel!,
          page: pageParam,
          size: 10,
        }),
      getNextPageParam: (lastPage) => {
        return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
      },
      initialPageParam: 0,
      select: (data) => ({
        pages: data.pages.map(createDogSchoolListWithMock),
        pageParams: data.pageParams,
      }),
    }),
};
