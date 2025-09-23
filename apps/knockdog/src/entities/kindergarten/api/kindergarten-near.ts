import { api } from '@shared/api';
import type { KindergartenNear } from '../model/kindergarten-near';

interface KindergartenNearRequest {
  id: string;
  lng: number;
  lat: number;
}

type KindergartenNearListResponse = KindergartenNear[];

function getKindergartenNearList({ id, lng, lat }: KindergartenNearRequest): Promise<KindergartenNearListResponse> {
  return api
    .get(`kindergarten/${id}/near`, {
      searchParams: {
        lng,
        lat,
      },
    })
    .json();
}

export { getKindergartenNearList, type KindergartenNearListResponse };
