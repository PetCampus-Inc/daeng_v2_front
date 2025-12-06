/**
 * 개발용 BBox 디버깅 컴포넌트
 * @description 서버에서 받은 bbox와 현재 뷰포트 bbox를 시각적으로 비교하기 위한 용도
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Rectangle } from '@knockdog/react-naver-map';
import type { BoundsSnapshot } from '../lib/searchState';
import { toBoundsSnapshot } from '../lib/bounds';

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
  viewportBounds: BoundsSnapshot | null;
  /**
   * 지도 인스턴스
   */
  map: naver.maps.Map | null;
}

function areBoundsEqual(bounds1: BoundsSnapshot | null, bounds2: BoundsSnapshot | null): boolean {
  if (!bounds1 || !bounds2) return bounds1 === bounds2;

  const epsilon = 1e-6;
  return (
    Math.abs(bounds1.swLng - bounds2.swLng) < epsilon &&
    Math.abs(bounds1.swLat - bounds2.swLat) < epsilon &&
    Math.abs(bounds1.neLng - bounds2.neLng) < epsilon &&
    Math.abs(bounds1.neLat - bounds2.neLat) < epsilon
  );
}

export function BBoxDebug({ map, serverBounds, viewportBounds }: BBoxDebugProps) {
  const [currentViewportBounds, setCurrentViewportBounds] = useState<BoundsSnapshot | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousBoundsRef = useRef<BoundsSnapshot | null>(null);

  // 지도 bounds 변경 시 현재 뷰포트 bounds 업데이트
  useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const bounds = map.getBounds();
      const snapshot = toBoundsSnapshot(bounds);
      if (snapshot && !areBoundsEqual(snapshot, previousBoundsRef.current)) {
        previousBoundsRef.current = snapshot;
        setCurrentViewportBounds(snapshot);
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

  const viewportBoundsLatLng = useMemo(() => {
    if (!activeViewportBounds) return null;
    return new naver.maps.LatLngBounds(
      new naver.maps.LatLng(activeViewportBounds.swLat, activeViewportBounds.swLng),
      new naver.maps.LatLng(activeViewportBounds.neLat, activeViewportBounds.neLng)
    );
  }, [activeViewportBounds]);

  if (!serverBoundsLatLng || !viewportBoundsLatLng) return null;

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
        bounds={viewportBoundsLatLng}
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
