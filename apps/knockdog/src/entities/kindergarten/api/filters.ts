import type { FilterResultCount } from '../model/filters';
import { api } from '@shared/api';

export type FilterResultCountParams = {
  bounds: string;
  filters: string;
};

export function getFilterResultCount(params: FilterResultCountParams) {
  const searchParams = new URLSearchParams({
    bounds: params.bounds,
    filters: params.filters,
  });
  return api.get('kindergarten/filters/result', { searchParams }).json<FilterResultCount>();
}
