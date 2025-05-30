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
    content: renderOriginContent,
  };

  // 오버레이 초기화
  useLayoutEffect(() => {
    const overlay = createReactOverlay({
      navermaps,
      options: overlayOptions,
    });

    overlayRef.current = overlay;
  }, []);

  // 오버레이 마운트/언마운트
  useEffect(() => {
    if (map.current && overlayRef.current)
      overlayRef.current.setMap(map.current);

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, []);

  // 오버레이 옵션 업데이트
  useEffect(() => {
    if (!overlayRef.current) return;

    overlayRef.current.setOptions(overlayOptions);
  }, [options]);

  return null;
}
