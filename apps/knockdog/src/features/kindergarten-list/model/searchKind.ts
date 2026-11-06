import type { FilterOption } from '@entities/kindergarten';

export type UrlSearchKind = 'REGION' | 'FILTER' | 'QUERY' | 'NONE';

interface UrlSearchState {
  query: string;
  filters: FilterOption[];
  region?: string | null;
}

export function inferSearchKindFromUrl(state: UrlSearchState): UrlSearchKind {
  const { query, filters, region } = state;

  if (region && region.trim().length > 0) return 'REGION';
  if (filters.length > 0) return 'FILTER';
  if (query.trim().length > 0) return 'QUERY';

  return 'NONE';
}
