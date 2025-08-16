import type { DogSchoolSearchListParams, DogSchoolSearchListResponse } from '../model/dogschool-list';
import api from '@shared/api/ky-client';

export abstract class DogSchoolListService {
  static async getDogSchoolSearchList(params: DogSchoolSearchListParams) {
    const searchParams = new URLSearchParams();
    searchParams.set('refPoint', params.refPoint);
    searchParams.set('bounds', params.bounds);
    searchParams.set('zoomLevel', params.zoomLevel.toString());
    searchParams.set('page', params.page?.toString() ?? '0');
    searchParams.set('size', params.size?.toString() ?? '10');

    return await api
      .get('kindergarten/map-view', {
        searchParams,
      })
      .json<DogSchoolSearchListResponse>();
  }
}
