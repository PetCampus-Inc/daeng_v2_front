'use client';

import { use, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { MapInstanceContext } from '../contexts';
import { useCurrentLocation, useNaverMaps } from '../hooks';
import { createEventListeners } from '../lib';
import { NaverMapOptions } from '../types';

interface NaverMapEventHandlers {
  onClick?: (e: naver.maps.PointerEvent) => void;
  onTap?: (e: naver.maps.PointerEvent) => void;
  onZoomChanged?: (zoom: number) => void;
  onDragStart?: (e: naver.maps.PointerEvent) => void;
  onDragEnd?: (e: naver.maps.PointerEvent) => void;
  onLoad?: (map: naver.maps.Map) => void;
}

export interface NaverMapCoreProps
  extends NaverMapOptions,
    NaverMapEventHandlers {
  children?: React.ReactNode;
}

export function NaverMapCore({
  children,
  onLoad,
  currentCenter,
  ...options
}: NaverMapCoreProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstanceRef = use(MapInstanceContext);

  const navermaps = useNaverMaps();
  const currentLocation = useCurrentLocation();

  // 지도 초기화
  useLayoutEffect(() => {
    if (currentCenter && !currentLocation) return;

    const mapOptions = {
      ...options,
      ...(currentCenter && currentLocation && { center: currentLocation }),
    };

    const mapInstance = new navermaps.Map('map', mapOptions);
    mapInstanceRef.current = mapInstance;

    setIsMapLoaded(true);

    return () => {
      mapInstance.destroy();
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
    };
  }, [currentCenter, currentLocation]);

  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;
    onLoad?.(mapInstanceRef.current);

    // 이벤트 리스너 등록
    const listeners = createEventListeners(mapInstanceRef.current, options);

    return () => {
      if (listeners) {
        naver.maps.Event.removeListener(listeners);
      }
    };
  }, [isMapLoaded, mapInstanceRef, options, onLoad]);

  return (
    <>
      <div id='map' style={{ width: '100%', height: '100%' }} />
      {isMapLoaded && children}
    </>
  );
}
