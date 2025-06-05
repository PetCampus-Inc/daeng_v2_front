'use client';

import { useEffect, useState } from 'react';

type Location = { lat: number; lng: number };

export function useCurrentLocation() {
  const [position, setPosition] = useState<Location | undefined>(undefined);

  useEffect(() => {
    try {
      window.navigator.geolocation.getCurrentPosition((position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return position;
}
