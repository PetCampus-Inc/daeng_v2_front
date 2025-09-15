import api from '@shared/api/ky-client';
import type { KindergartenNear } from '../model/kindergarten-near';

interface KindergartenNearRequest {
  id: string;
  lng: number;
  lat: number;
}

type KindergartenNearListResponse = KindergartenNear[];

function getKindergartenNearList({ id, lng, lat }: KindergartenNearRequest): Promise<KindergartenNearListResponse> {
  return api
    .get(`/api/v0/kindergarten/${id}/near`, {
      searchParams: {
        lng,
        lat,
      },
    })
    .json();
}

export { getKindergartenNearList, type KindergartenNearListResponse };
