import type { KindergartenSearchList } from '../model/kindergarten';
import { api } from '@shared/api';

export type KindergartenSearchListParams = {
  refPoint: string;
  bounds: string;
  zoomLevel: number;
  page?: number;
  size?: number;
};

export function getKindergartenSearchList(params: KindergartenSearchListParams) {
  const searchParams = new URLSearchParams();
  searchParams.set('refPoint', params.refPoint);
  searchParams.set('bounds', params.bounds);
  searchParams.set('zoomLevel', params.zoomLevel.toString());
  searchParams.set('page', params.page?.toString() ?? '0');
  searchParams.set('size', params.size?.toString() ?? '10');

  return api
    .get('kindergarten/map-view', {
      searchParams,
    })
    .json<KindergartenSearchList>();
}
