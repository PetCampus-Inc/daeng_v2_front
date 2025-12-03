import type { Autocomplete } from '../model/autocomplete';
import { serializeCoords } from '@shared/lib';
import { api } from '@shared/api';

export type KindergartenAutocompleteParams = {
  query: string;
  coord: { lat: number; lng: number };
};

export function getKindergartenAutocomplete(params: KindergartenAutocompleteParams) {
  return api
    .get('autocomplete', {
      searchParams: {
        query: params.query,
        coord: serializeCoords(params.coord),
      },
    })
    .json<Autocomplete>();
}
