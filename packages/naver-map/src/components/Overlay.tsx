'use client';

import { use, useEffect, useLayoutEffect } from 'react';

import { OverlayHandlersContext, OverlayContext } from '../contexts';
import { useNaverMaps } from '../hooks';
import { createReactOverlay } from '../lib';
import { getOverlayPositionStyle } from '../utils';
import type { OverlayDirection, OverlayOffset, OverlayOptions } from '../types';

interface OverlayProps extends OverlayOptions {
  id: string;
  offset?: OverlayOffset;
  direction?: OverlayDirection;
}

export function Overlay({
  offset,
  direction = 'center',
  zIndex = 1,
  ...options
}: OverlayProps) {
  const overlayRefs = use(OverlayContext);
  const { registerOverlay, unregisterOverlay } = use(OverlayHandlersContext);

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

  // 오버레이 초기화
  useLayoutEffect(() => {
    const overlay = createReactOverlay({
      navermaps,
      options: overlayOptions,
    });

    registerOverlay(options.id, overlay);

    return () => unregisterOverlay(options.id);
  }, []);

  // 오버레이 옵션 업데이트
  useEffect(() => {
    const overlay = overlayRefs.get(options.id);

    if (overlay) overlay.setOptions(overlayOptions);
  }, [overlayOptions]);

  return null;
}
