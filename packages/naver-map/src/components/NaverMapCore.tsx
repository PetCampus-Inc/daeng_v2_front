'use client';

import { PropsWithChildren, use, useLayoutEffect, useRef } from 'react';

import { MapInstanceContext } from '../contexts';
import { CurrentLocationMarker } from './CurrentLocationMarker';
import { useCurrentLocation, useNaverMaps } from '../hooks';
import { NaverMapOptions } from '../types';

export function NaverMapCore({
  children,
  userLocationMarker,
  currentCenter,
  ...options
}: PropsWithChildren<NaverMapOptions>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = use(MapInstanceContext);

  const navermaps = useNaverMaps();
  const currentLocation = useCurrentLocation();

  // 지도 초기화
  useLayoutEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new navermaps.Map(mapRef.current, {
      ...options,
    });

    mapInstanceRef.current = mapInstance;

    return () => mapInstance.destroy();
  }, [navermaps]);

  // 사용자의 위치를 지도의 중심으로 설정
  useLayoutEffect(() => {
    if (currentCenter && currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(currentLocation);
    }
  }, [currentCenter, currentLocation]);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {userLocationMarker && <CurrentLocationMarker />}
      {children}
    </>
  );
}
