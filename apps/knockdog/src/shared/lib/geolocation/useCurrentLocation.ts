'use client';

import { useEffect, useState } from 'react';

type Location = { lat: number; lng: number };

export function useCurrentLocation() {
  const [position, setPosition] = useState<Location | undefined>(undefined);

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !('geolocation' in window.navigator)) return;

      const callGetCurrentPosition = () => {
        window.navigator.geolocation.getCurrentPosition((position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        });
      };

      // Permission API가 있으면 먼저 확인, 없으면 바로 요청
      // Permission이 denied면 요청하지 않음
      const anyNavigator = window.navigator as Navigator & {
        permissions?: { query?: (p: { name: 'geolocation' }) => Promise<PermissionStatus> };
      };
      const query = anyNavigator.permissions?.query;

      if (query) {
        query({ name: 'geolocation' })
          .then((status) => {
            if (status.state === 'denied') return;
            callGetCurrentPosition();
          })
          .catch(() => {
            callGetCurrentPosition();
          });
      } else {
        callGetCurrentPosition();
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return position;
}
