'use client';

import { use, useEffect, useLayoutEffect, useState } from 'react';

import { MapInstanceContext } from '../contexts';
import { useNaverMaps } from '../hooks';
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
  ...options
}: NaverMapCoreProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstanceRef = use(MapInstanceContext);

  const navermaps = useNaverMaps();

  // 지도 초기화
  useLayoutEffect(() => {
    if (!options.center) return;

    const initMapCenter = new naver.maps.LatLng(
      options.center.lat,
      options.center.lng
    );

    const mapInstance = new navermaps.Map('map', {
      ...options,
      center: initMapCenter,
    });
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

    const newCenter = new naver.maps.LatLng(
      options.center.lat,
      options.center.lng
    );

    if (prevCenter.equals(newCenter)) return;

    map.panTo(newCenter);
  }, [isMapLoaded, mapInstanceRef, options.center]);

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
