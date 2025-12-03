'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentLocation } from './getCurrentLocation';
import { globalQueryKeys } from '@shared/constants';

export function useGeolocationQuery(enabled = true) {
  return useQuery({
    queryKey: globalQueryKeys.basePoint.current(),
    queryFn: () => getCurrentLocation({ enableHighAccuracy: true, timeout: 5000, maximumAge: 30_000 }),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      return {
        lat: Number(data.coords.latitude.toFixed(6)),
        lng: Number(data.coords.longitude.toFixed(6)),
      };
    },
  });
}
