import type { FilterOption } from '../config/filter-options';
import { serializeBounds, serializeFilters } from '../lib/serialize';
import type { Aggregation, KindergartenSearchList } from '../model/search-list';
import { api } from '@shared/api';
import { serializeCoords } from '@shared/lib';
import type { Bounds, Coord } from '@shared/types';

export type SortType = 'DISTANCE' | 'REVIEW';

export type KindergartenSearchListParams = {
  refPoint: Coord;
  zoomLevel: number;
  bounds?: Bounds | null;
  distance?: string;
  query?: string;
  filters?: FilterOption[];
  rank?: 'DISTANCE' | 'REVIEW';
  page?: number;
  size?: number;
};

export function getKindergartenSearchList(params: KindergartenSearchListParams) {
  const serializedBounds = serializeBounds(params.bounds);
  const serializedFilters = serializeFilters(params.filters);
  const serializedRefPoint = serializeCoords(params.refPoint, { order: 'lnglat' });

  const searchParams = new URLSearchParams({
    refPoint: serializedRefPoint,
    zoomLevel: params.zoomLevel.toString(),
    ...(serializedBounds && { bounds: serializedBounds }),
    ...(params.distance && { distance: params.distance }),
    ...(params.query && { query: params.query.trim() }),
    ...(serializedFilters && { filters: serializedFilters }),
    ...(params.rank && { rank: params.rank }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.size && { size: params.size.toString() }),
  });

  return api
    .get('kindergarten/map-view', {
      searchParams,
    })
    .json<KindergartenSearchList>();
}

export type KindergartenAggregationParams = {
  refPoint: Coord;
  zoomLevel: number;
  bounds?: Bounds | null;
  distance?: string;
  query?: string;
  filters?: FilterOption[];
};

export function getKindergartenAggregation(params: KindergartenAggregationParams) {
  const serializedBounds = serializeBounds(params.bounds);
  const serializedFilters = serializeFilters(params.filters);
  const serializedRefPoint = serializeCoords(params.refPoint);

  const searchParams = new URLSearchParams({
    refPoint: serializedRefPoint,
    zoomLevel: params.zoomLevel.toString(),
    ...(serializedBounds && { bounds: serializedBounds }),
    ...(params.distance && { distance: params.distance }),
    ...(serializedFilters && { filters: serializedFilters }),
  });
  return api.get('kindergarten/map-view/aggregation', { searchParams }).json<Aggregation>();
}
