import api from '@shared/api/ky-client';
import type { Kindergarten } from '../model/kindergarten';

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
