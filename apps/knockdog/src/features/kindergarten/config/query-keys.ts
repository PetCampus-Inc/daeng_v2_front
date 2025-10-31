import type {
  FilterResultCountQueryParams,
  KindergartenAggregationQueryParams,
  KindergartenSearchListQueryParams,
} from '../api/kindergartenQuery';
import { serializeBounds, serializeCoords } from '../lib/serialize';

export const kindergartenKeys = {
  all: ['kindergarten'],
  searchList: (params: Partial<KindergartenSearchListQueryParams>) => [
    ...kindergartenKeys.all,
    'search-list',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds),
    params.zoomLevel,
    params.filters,
    params.rank,
  ],
  aggregation: (params: Partial<KindergartenAggregationQueryParams>) => [
    ...kindergartenKeys.all,
    'aggregation',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds),
    params.zoomLevel,
    params.filters,
  ],
  filterResultCount: (params: Partial<FilterResultCountQueryParams>) => [
    ...kindergartenKeys.all,
    'filter-result-count',
    serializeBounds(params.bounds),
    params.filters,
  ],
} as const;
