'use client';

import { use, useEffect, useLayoutEffect, useRef } from 'react';

import { MapInstanceContext } from '../contexts';
import { useNaverMaps } from '../hooks';
import { createReactOverlay, type ReactOverlayView } from '../lib';
import { getOverlayPositionStyle } from '../utils';
import type { OverlayDirection, OverlayOffset, OverlayOptions } from '../types';

interface OverlayProps extends OverlayOptions {
  offset?: OverlayOffset;
  direction?: OverlayDirection;
}

export function Overlay({
  offset,
  direction = 'center',
  zIndex = 1,
  ...options
}: OverlayProps) {
  const overlayRef = useRef<ReactOverlayView | null>(null);

  const map = use(MapInstanceContext);
  const navermaps = useNaverMaps();

  // 위치 조정된 컴포넌트
  const renderOriginContent = (
    <div style={{ position: 'relative' }}>
      <div style={getOverlayPositionStyle(direction, offset)}>
        {options.content}
      </div>
    </div>
  );

  const overlayOptions = {
    ...options,
    zIndex,
    content: renderOriginContent,
  };

  const drawOverlay = () => {
    if (!map.current || !overlayRef.current) return;

    const mapBounds = map.current.getBounds();
    const markerPosition = overlayRef.current.getPosition();
    const isMapBounds = mapBounds.hasPoint(markerPosition);

    // 오버레이 좌표가 지도 영역 안에 있는지 확인
    if (isMapBounds && !overlayRef.current.getMap()) {
      overlayRef.current.setMap(map.current);
    } else if (!isMapBounds && overlayRef.current.getMap()) {
      overlayRef.current.setMap(null);
    }
  };

  // 오버레이 초기화 및 마운트/언마운트
  useLayoutEffect(() => {
    const overlay = createReactOverlay({
      navermaps,
      options: overlayOptions,
    });

    overlayRef.current = overlay;
    drawOverlay();

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, []);

  // 오버레이 이벤트
  useEffect(() => {
    if (!map.current) return;

    const listeners = [
      map.current.addListener('dragend', drawOverlay),
      map.current.addListener('zoom_changed', drawOverlay),
    ];

    return () => {
      navermaps.Event.removeListener(listeners);
    };
  }, [drawOverlay]);

  // 오버레이 옵션 업데이트
  useEffect(() => {
    if (!overlayRef.current) return;

    overlayRef.current.setOptions(overlayOptions);
  }, [overlayOptions]);

  return null;
}
