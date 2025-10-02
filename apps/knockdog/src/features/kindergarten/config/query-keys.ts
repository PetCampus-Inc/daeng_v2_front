import type {
  KindergartenAggregationQueryParams,
  KindergartenSearchListQueryParams,
} from '../api/useKindergartenQuery';
import { serializeBounds, serializeCoords } from '../lib/serialize';

export const kindergartenKeys = {
  all: ['kindergarten'],
  searchList: (params: Partial<KindergartenSearchListQueryParams>) => [
    ...kindergartenKeys.all,
    'search-list',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds),
    params.zoomLevel,
  ],
  aggregation: (params: Partial<KindergartenAggregationQueryParams>) => [
    ...kindergartenKeys.all,
    'aggregation',
    serializeCoords(params.refPoint),
    serializeBounds(params.bounds),
    params.zoomLevel,
  ],
} as const;
