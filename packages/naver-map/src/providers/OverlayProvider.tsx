'use client';

import { use, useEffect, useRef } from 'react';

import { type ReactOverlayView } from '../lib';
import { useNaverMaps } from '../hooks';
import {
  MapInstanceContext,
  OverlayContext,
  OverlayHandlersContext,
  type OverlayMap,
} from '../contexts';
import { throttle } from '../utils/throttle';

interface OverlayProviderProps {
  children: React.ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const overlayMapRef = useRef<OverlayMap>(new Map());

  const map = use(MapInstanceContext);
  const navermaps = useNaverMaps();

  const drawOverlays = throttle(() => {
    if (!map.current) return;

    const mapBounds = map.current.getBounds();
    overlayMapRef.current.forEach((overlay) => {
      const overlayPosition = overlay.getPosition();
      const isMapBounds = mapBounds.hasPoint(overlayPosition);

      if (isMapBounds && !overlay.getMap()) {
        overlay.setMap(map.current);
      } else if (!isMapBounds && overlay.getMap()) {
        overlay.setMap(null);
      }
    });
  }, 300);

  const registerOverlay = (id: string, overlay: ReactOverlayView) => {
    overlayMapRef.current.set(id, overlay);
    drawOverlays();
  };

  const unregisterOverlay = (id: string) => {
    const overlay = overlayMapRef.current.get(id);

    if (overlay) {
      overlay.setMap(null);
      overlayMapRef.current.delete(id);
    }
  };

  useEffect(() => {
    if (!map.current) return;

    drawOverlays();

    const listener = map.current.addListener('bounds_changed', drawOverlays);
    return () => navermaps.Event.removeListener(listener);
  }, [drawOverlays]);

  return (
    <OverlayHandlersContext value={{ registerOverlay, unregisterOverlay }}>
      <OverlayContext value={overlayMapRef.current}>{children}</OverlayContext>
    </OverlayHandlersContext>
  );
}
