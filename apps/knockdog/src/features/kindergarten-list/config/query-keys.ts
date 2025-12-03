import type {
  FilterResultCountQueryParams,
  KindergartenAggregationQueryParams,
  KindergartenSearchListQueryParams,
} from '../api/kindergartenQuery';
import { toBounds, isValidLatLngBounds } from '../lib/map-adapter';
import { serializeBounds } from '@entities/kindergarten';
import { serializeCoords } from '@shared/lib';

export const kindergartenKeys = {
  all: ['kindergarten'],
  searchList: (params: Partial<KindergartenSearchListQueryParams>) => [
    ...kindergartenKeys.all,
    'search-list',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds ? toBounds(params.bounds) : null),
    params.zoomLevel,
    params.filters,
    params.query,
    params.rank,
    params.searchMode,
  ],
  aggregation: (params: Partial<KindergartenAggregationQueryParams>) => [
    ...kindergartenKeys.all,
    'aggregation',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds ? toBounds(params.bounds) : null),
    params.zoomLevel,
    params.filters,
    params.query,
    params.searchMode,
  ],
  filterResultCount: (params: Partial<FilterResultCountQueryParams>) => [
    ...kindergartenKeys.all,
    'filter-result-count',
    serializeBounds(params.bounds && isValidLatLngBounds(params.bounds) ? toBounds(params.bounds) : null),
    params.filters,
  ],
} as const;
