import { queryOptions } from '@tanstack/react-query';
import { getKindergartenAutocomplete, type KindergartenAutocompleteParams } from '@entities/kindergarten';
import { isValidCoord } from '@shared/lib';

type AutocompleteQueryParams = {
  lat?: number;
  lng?: number;
} & Omit<KindergartenAutocompleteParams, 'lat' | 'lng'>;

export const searchQueryOptions = {
  autocomplete: ({ query, lat, lng }: AutocompleteQueryParams) => {
    return queryOptions({
      queryKey: ['search', query, lat, lng],
      queryFn: () => getKindergartenAutocomplete({ query, lat: lat!, lng: lng! }),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      enabled: isValidCoord({ lat, lng }) && query.trim().length > 0,
      placeholderData: (prev) => prev,
    });
  },
};
