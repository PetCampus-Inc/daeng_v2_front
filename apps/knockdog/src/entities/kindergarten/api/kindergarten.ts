import type { FilterOption } from '../config/filter-options';
import type { Aggregation, KindergartenSearchList } from '../model/kindergarten';
import { api } from '@shared/api';

export type KindergartenSearchListParams = {
  refPoint: string;
  bounds: string;
  zoomLevel: number;
  page?: number;
  size?: number;
  filters?: FilterOption;
  rank?: 'DISTANCE' | 'REVIEW';
};

export function getKindergartenSearchList(params: KindergartenSearchListParams) {
  const searchParams = new URLSearchParams({
    refPoint: params.refPoint,
    bounds: params.bounds,
    zoomLevel: params.zoomLevel.toString(),
    ...(params.page && { page: params.page.toString() }),
    ...(params.size && { size: params.size.toString() }),
    ...(params.filters && { filters: JSON.stringify(params.filters) }),
    ...(params.rank && { rank: params.rank }),
  });

  return api
    .get('kindergarten/map-view', {
      searchParams,
    })
    .json<KindergartenSearchList>();
}

export type KindergartenAggregationParams = {
  refPoint: string;
  bounds: string;
  zoomLevel: number;
  filters?: FilterOption;
};

export function getKindergartenAggregation(params: KindergartenAggregationParams) {
  const searchParams = new URLSearchParams({
    refPoint: params.refPoint,
    bounds: params.bounds,
    zoomLevel: params.zoomLevel.toString(),
    ...(params.filters && { filters: JSON.stringify(params.filters) }),
  });
  return api.get('kindergarten/map-view/aggregation', { searchParams }).json<Aggregation>();
}
