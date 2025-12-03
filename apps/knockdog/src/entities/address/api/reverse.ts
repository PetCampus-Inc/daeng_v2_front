import type { ReverseGeocodeResponse } from '../model/reverse';
import { api } from '@shared/api';

export type ReverseGeocodeParams = {
  lat: number;
  lng: number;
};

export function getReverseGeocode(params: ReverseGeocodeParams) {
  return api
    .get('address/reverse-geo', { searchParams: { lat: params.lat, lng: params.lng } })
    .json<ReverseGeocodeResponse>()
    .then((res) => res.data);
}
