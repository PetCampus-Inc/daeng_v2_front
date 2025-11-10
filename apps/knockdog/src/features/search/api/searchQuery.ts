import { queryOptions } from '@tanstack/react-query';
import { getKindergartenAutocomplete, type KindergartenAutocompleteParams } from '@entities/kindergarten';
import { isValidCoord } from '@shared/lib';
import { serializeCoords } from '@features/kindergarten/lib/serialize';

type AutocompleteQueryParams = {
  coord?: { lat: number; lng: number };
} & Omit<KindergartenAutocompleteParams, 'coord'>;

export const searchQueryOptions = {
  autocomplete: ({ query, coord }: AutocompleteQueryParams) => {
    return queryOptions({
      queryKey: ['search', query, coord],
      queryFn: () => getKindergartenAutocomplete({ query, coord: serializeCoords(coord) }),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      enabled: isValidCoord(coord) && query.trim().length > 0,
      placeholderData: (prev) => prev,
    });
  },
};
