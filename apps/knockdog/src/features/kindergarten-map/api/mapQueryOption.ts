import { queryOptions } from '@tanstack/react-query';
import { getReverseGeocode, ReverseGeocodeParams } from '@entities/address';

type ReverseGeocodeQueryParams = ReverseGeocodeParams & { zoomLevel?: number | null };

export const mapQueryOptions = {
  reverseGeocode: ({ lat, lng, zoomLevel }: ReverseGeocodeQueryParams) => {
    return queryOptions({
      queryKey: ['reverseGeocode', lat, lng, zoomLevel ?? null],
      queryFn: () => getReverseGeocode({ lat, lng }),
      enabled: !!lat && !!lng && lat !== 0 && lng !== 0,
      select: (data) => data.documents?.[0]?.address,
    });
  },
};
