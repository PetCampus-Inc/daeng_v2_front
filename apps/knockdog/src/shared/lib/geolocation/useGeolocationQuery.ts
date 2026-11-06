'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentLocation } from './getCurrentLocation';
import { LocationPermissionError, LocationServiceDisabledError } from './errors';
import type { Accuracy } from '@knockdog/bridge-core';

interface UseGeolocationQueryOptions {
  enabled?: boolean;
  options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  };
}

export function useGeolocationQuery({ enabled = true, options }: UseGeolocationQueryOptions = {}) {
  const accuracy: Accuracy = options?.enableHighAccuracy ? 'high' : 'balanced';
  const maxAge = options?.maximumAge ?? 300_000;
  return useQuery({
    queryKey: ['geolocation', accuracy, maxAge],
    queryFn: async () => {
      const result = await getCurrentLocation({
        accuracy,
        maxAge,
        fallbackOnError: true,
      });
      return result.location;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => {
      // 권한 에러나 서비스 꺼짐은 재시도 불필요
      if (error instanceof LocationPermissionError) return false;
      if (error instanceof LocationServiceDisabledError) return false;
      return failureCount < 1;
    },
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
