'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentLocation } from './getCurrentLocation';
import { globalQueryKeys } from '@shared/constants';

// TODO: 향후 Native에서 현재 위치 조회 API 사용 시 삭제 필요!!!
export function useGeolocationQuery(enabled = true) {
  return useQuery({
    queryKey: globalQueryKeys.basePoint.current(),
    queryFn: () => getCurrentLocation({ enableHighAccuracy: true, timeout: 5000, maximumAge: 30_000 }),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
