'use client';

import {
  PropsWithChildren,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { MapInstanceContext } from '../contexts';
import { useCurrentLocation, useNaverMaps } from '../hooks';
import { NaverMapOptions } from '../types';

export function NaverMapCore({
  children,
  currentCenter,
  ...options
}: PropsWithChildren<NaverMapOptions>) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = use(MapInstanceContext);

  const navermaps = useNaverMaps();
  const currentLocation = useCurrentLocation();

  // 지도 초기화
  useLayoutEffect(() => {
    if (!mapRef.current || (currentCenter && !currentLocation)) return;

    const mapOptions = {
      ...options,
    };

    if (currentCenter && currentLocation) {
      mapOptions.center = currentLocation;
    }

    const mapInstance = new navermaps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = mapInstance;

    setIsMapLoaded(true);

    return () => {
      mapInstance.destroy();
      setIsMapLoaded(false);
    };
  }, [navermaps, currentCenter, currentLocation]);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {isMapLoaded && children}
    </>
  );
}
