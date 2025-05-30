'use client';

import { useEffect, useState } from 'react';

export function useCurrentLocation() {
  const [position, setPosition] = useState<naver.maps.LatLng | undefined>(
    undefined
  );

  useEffect(() => {
    try {
      window.navigator.geolocation.getCurrentPosition((position) => {
        setPosition(
          new naver.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
        );
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return position;
}
