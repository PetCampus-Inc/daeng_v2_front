import type { Autocomplete } from '../model/autocomplete';
import { api } from '@shared/api';

export type KindergartenAutocompleteParams = {
  query: string;
  lat: number;
  lng: number;
};

export function getKindergartenAutocomplete(params: KindergartenAutocompleteParams) {
  return api.get('autocomplete', { searchParams: params }).json<Autocomplete>();
}
