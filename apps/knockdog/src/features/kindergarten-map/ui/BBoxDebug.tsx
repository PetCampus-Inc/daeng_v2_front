/**
 * 개발용 BBox 디버깅 컴포넌트
 * @description 서버에서 받은 bbox와 현재 뷰포트 bbox를 시각적으로 비교하기 위한 용도
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Rectangle } from '@knockdog/react-naver-map';

function isValidLatLngBounds(bounds?: naver.maps.Bounds | null): bounds is naver.maps.LatLngBounds {
  if (!bounds) return false;
  return (
    bounds instanceof naver.maps.LatLngBounds &&
    typeof bounds.getSW === 'function' &&
    typeof bounds.getNE === 'function'
  );
}

interface BBoxDebugProps {
  /**
   * 서버에서 받은 bbox
   */
  serverBounds: {
    swLng: number;
    swLat: number;
    neLng: number;
    neLat: number;
  } | null;
  /**
   * 현재 뷰포트의 bbox (mapSnapshot.bounds)
   */
  viewportBounds: naver.maps.LatLngBounds | null;
  /**
   * 지도 인스턴스
   */
  map: naver.maps.Map | null;
}

function areBoundsEqual(bounds1: naver.maps.LatLngBounds | null, bounds2: naver.maps.LatLngBounds | null): boolean {
  if (!bounds1 || !bounds2) return bounds1 === bounds2;

  const sw1 = bounds1.getSW();
  const ne1 = bounds1.getNE();
  const sw2 = bounds2.getSW();
  const ne2 = bounds2.getNE();

  const epsilon = 1e-6;
  return (
    Math.abs(sw1.x - sw2.x) < epsilon &&
    Math.abs(sw1.y - sw2.y) < epsilon &&
    Math.abs(ne1.x - ne2.x) < epsilon &&
    Math.abs(ne1.y - ne2.y) < epsilon
  );
}

export function BBoxDebug({ serverBounds, viewportBounds, map }: BBoxDebugProps) {
  const [currentViewportBounds, setCurrentViewportBounds] = useState<naver.maps.LatLngBounds | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousBoundsRef = useRef<naver.maps.LatLngBounds | null>(null);

  // 지도 bounds 변경 시 현재 뷰포트 bounds 업데이트
  useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const bounds = map.getBounds();
      if (isValidLatLngBounds(bounds)) {
        if (!areBoundsEqual(bounds, previousBoundsRef.current)) {
          previousBoundsRef.current = bounds;
          setCurrentViewportBounds(bounds);
        }
      }
    };

    updateBounds();

    const listener = naver.maps.Event.addListener(map, 'bounds_changed', updateBounds);

    updateIntervalRef.current = setInterval(updateBounds, 500);

    return () => {
      naver.maps.Event.removeListener(listener);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [map]);

  const activeViewportBounds = currentViewportBounds || viewportBounds;

  const serverBoundsLatLng = useMemo(() => {
    if (!serverBounds) return null;

    return new naver.maps.LatLngBounds(
      new naver.maps.LatLng(serverBounds.swLat, serverBounds.swLng),
      new naver.maps.LatLng(serverBounds.neLat, serverBounds.neLng)
    );
  }, [serverBounds]);

  //   useEffect(() => {
  //     if (!serverBoundsLatLng || !activeViewportBounds) return;
  //     console.log('뷰포트 bbox', activeViewportBounds);
  //     console.log('서버 bbox', serverBoundsLatLng);
  //   }, [serverBoundsLatLng, activeViewportBounds]);

  if (!serverBoundsLatLng || !activeViewportBounds) return null;

  return (
    <>
      {/* 서버에서 받은 bbox - 파란색 */}
      <Rectangle
        bounds={serverBoundsLatLng}
        fillColor='#3b82f6'
        fillOpacity={0.2}
        strokeColor='#3b82f6'
        strokeWeight={2}
        strokeOpacity={0.8}
        strokeStyle='solid'
        clickable={false}
        zIndex={1000}
      />

      {/* 현재 뷰포트 bbox - 빨간색 */}
      <Rectangle
        bounds={activeViewportBounds}
        fillColor='#ef4444'
        fillOpacity={0.2}
        strokeColor='#ef4444'
        strokeWeight={2}
        strokeOpacity={0.8}
        strokeStyle='dash'
        clickable={false}
        zIndex={1001}
      />
    </>
  );
}
