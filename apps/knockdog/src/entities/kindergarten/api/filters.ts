import type { FilterResultCount } from '../model/filters';
import type { FilterOption } from '../config/filter-options';
import { serializeBounds, serializeFilters } from '../lib/serialize';
import { api } from '@shared/api';
import type { Bounds } from '@shared/types';

export type FilterResultCountParams = {
  bounds?: Bounds | null;
  filters: FilterOption[];
};

export function getFilterResultCount(params: FilterResultCountParams) {
  const serializedBounds = serializeBounds(params.bounds);
  const serializedFilters = serializeFilters(params.filters);

  const searchParams = new URLSearchParams({
    ...(serializedBounds && { bounds: serializedBounds }),
    ...(serializedFilters && { filters: serializedFilters }),
  });
  return api.get('kindergarten/filters/result', { searchParams }).json<FilterResultCount>();
}
