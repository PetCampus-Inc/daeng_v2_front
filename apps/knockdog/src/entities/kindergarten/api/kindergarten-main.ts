import { api, type ApiResponse } from '@shared/api';

import type { Kindergarten } from '../model/kindergarten';

// @TODO API Response, 타입 정의 필요
export interface KindergartenMainParams {
  id: string;
  lng: number;
  lat: number;
}

function isKindergartenId(id: string | null | undefined): id is string {
  return typeof id === 'string' && id.length > 0 && id !== 'null' && id !== 'undefined';
}

function getKindergartenMain({ id, lng, lat }: KindergartenMainParams): Promise<Kindergarten> {
  if (!isKindergartenId(id)) return Promise.reject(new Error('유치원 id가 없습니다'));

  return api
    .get(`kindergarten/main/${id}`, {
      searchParams: {
        lng,
        lat,
      },
    })
    .json();
}

export { getKindergartenMain, isKindergartenId };
