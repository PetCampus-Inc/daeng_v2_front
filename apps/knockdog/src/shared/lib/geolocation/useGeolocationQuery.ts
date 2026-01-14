'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentLocation } from './getCurrentLocation';

interface UseGeolocationQueryOptions {
  enabled?: boolean;
  options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  };
}

export function useGeolocationQuery({ enabled = true, options }: UseGeolocationQueryOptions = {}) {
  return useQuery({
    queryKey: ['current', options],
    queryFn: () =>
      getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30_000,
        ...options,
      }),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retryOnMount: true,
    select: (data) => {
      return {
        lat: Number(data.coords.latitude.toFixed(6)),
        lng: Number(data.coords.longitude.toFixed(6)),
      };
    },
  });
}
