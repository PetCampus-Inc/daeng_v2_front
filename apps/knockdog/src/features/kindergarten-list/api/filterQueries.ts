import { queryOptions } from '@tanstack/react-query';
import { getFilterResultCount, isValidBounds, serializeBounds, type FilterOption } from '@entities/kindergarten';
import type { Bounds } from '@shared/types';

interface FilterResultCountQueryParams {
  bounds: Bounds | null;
  filters: FilterOption[];
}

export const filterQueries = {
  keys: {
    all: () => ['kindergarten', 'filter'] as const,
    resultCount: (params: FilterResultCountQueryParams) => [
      ...filterQueries.keys.all(),
      'filter-result-count',
      serializeBounds(params.bounds),
      params.filters,
    ],
  },

  resultCount: (params: FilterResultCountQueryParams) =>
    queryOptions({
      queryKey: [...filterQueries.keys.resultCount(params)],
      queryFn: () =>
        getFilterResultCount({
          bounds: params.bounds,
          filters: params.filters,
        }),
      enabled: params.filters.length > 0 && isValidBounds(params.bounds),
    }),
};
