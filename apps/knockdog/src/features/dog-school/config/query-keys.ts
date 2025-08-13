import { serializeBounds, serializeCoords } from '@entities/dog-school/lib/serialize';
import type { DogSchoolSearchListQueryParams } from '@entities/dog-school/model/dogschool-list';

export const dogSchoolKeys = {
  all: ['dog-school'],
  searchList: (params: Partial<DogSchoolSearchListQueryParams>) => [
    ...dogSchoolKeys.all,
    'search-list',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds),
    params.zoomLevel,
  ],
} as const;
