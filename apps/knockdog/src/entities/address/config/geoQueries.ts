import { queryOptions } from '@tanstack/react-query';
import { getReverseGeocode, type ReverseGeocodeParams } from '@entities/address';

type ReverseGeocodeQueryParams = ReverseGeocodeParams & { zoomLevel?: number | null };

export const geoQueries = {
  keys: {
    reverseGeocode: (params: ReverseGeocodeQueryParams) =>
      ['reverseGeocode', params.lat, params.lng, params.zoomLevel] as const,
  },

  reverseGeocode: ({ lat, lng, zoomLevel }: ReverseGeocodeQueryParams) =>
    queryOptions({
      queryKey: [...geoQueries.keys.reverseGeocode({ lat, lng, zoomLevel: zoomLevel ?? null })],
      queryFn: () => getReverseGeocode({ lat, lng }),
      enabled: !!lat && !!lng && lat !== 0 && lng !== 0,
      select: (data) => data.documents?.[0]?.address,
    }),
};
