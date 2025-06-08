'use client';

import { use, useEffect, useLayoutEffect, useState } from 'react';

import { OverlayProvider } from '../providers';
import { MapInstanceContext } from '../contexts';
import { useNaverMaps } from '../hooks';
import { createEventListeners } from '../lib';

interface NaverMapEventHandlers {
  onClick?: (e: naver.maps.PointerEvent) => void;
  onTap?: (e: naver.maps.PointerEvent) => void;
  onZoomChanged?: (zoom: number) => void;
  onDragStart?: (e: naver.maps.PointerEvent) => void;
  onDragEnd?: (e: naver.maps.PointerEvent) => void;
  onLoad?: (map: naver.maps.Map) => void;
}

export interface NaverMapCoreProps
  extends naver.maps.MapOptions,
    NaverMapEventHandlers {
  children?: React.ReactNode;
}

export function NaverMapCore({
  children,
  onLoad,
  ...options
}: NaverMapCoreProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstanceRef = use(MapInstanceContext);

  const navermaps = useNaverMaps();

  // 지도 초기화
  useLayoutEffect(() => {
    const mapInstance = new navermaps.Map('map', { ...options });
    mapInstanceRef.current = mapInstance;

    setIsMapLoaded(true);

    return () => {
      mapInstance.destroy();
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !options.center) return;

    const map = mapInstanceRef.current;
    const prevCenter = map.getCenter();

    const newCenter = new naver.maps.LatLng(options.center);

    if (prevCenter.equals(newCenter)) return;

    map.panTo(newCenter);
  }, [isMapLoaded, mapInstanceRef, options.center]);

  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    onLoad?.(mapInstanceRef.current);

    const listeners = createEventListeners(mapInstanceRef.current, options);
    return () => naver.maps.Event.removeListener(listeners);
  }, [isMapLoaded, mapInstanceRef, options, onLoad]);

  return (
    <>
      <div id='map' style={{ width: '100%', height: '100%' }} />
      {isMapLoaded && <OverlayProvider>{children}</OverlayProvider>}
    </>
  );
}
