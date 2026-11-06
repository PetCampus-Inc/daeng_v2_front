import { queryOptions } from '@tanstack/react-query';
import { getKindergartenAutocomplete, type KindergartenAutocompleteParams } from '@entities/kindergarten';
import { isValidCoord } from '@shared/lib';
import type { Coord } from '@shared/types';

type AutocompleteQueryParams = {
  coord?: Coord;
} & Omit<KindergartenAutocompleteParams, 'coord'>;

export const searchQueryOptions = {
  autocomplete: ({ query, coord }: AutocompleteQueryParams) => {
    return queryOptions({
      queryKey: ['search', query, coord],
      queryFn: () => {
        // FIXME: 좌표가 없으면 에러 던지기 or 페칭 실행 안 함
        if (!coord) return;
        return getKindergartenAutocomplete({ query, coord });
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      enabled: isValidCoord(coord) && query.trim().length > 0,
      placeholderData: (prev) => prev,
    });
  },
};
