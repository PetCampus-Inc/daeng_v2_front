import { api } from '@shared/api';

import type { Kindergarten } from '../model/kindergarten';

// @TODO API Response, 타입 정의 필요
export interface KindergartenMainRequest {
  id: string;
  lng: number;
  lat: number;
}

function getKindergartenMain({ id, lng, lat }: KindergartenMainRequest): Promise<Kindergarten> {
  return api
    .get(`/api/v0/kindergarten/main/${id}`, {
      searchParams: {
        lng,
        lat,
      },
    })
    .json();
}

export { getKindergartenMain };
