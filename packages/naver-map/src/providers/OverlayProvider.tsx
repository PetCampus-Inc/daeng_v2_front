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

interface OverlayProviderProps {
  children: React.ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const overlayMapRef = useRef<OverlayMap>(new Map());

  const map = use(MapInstanceContext);
  const navermaps = useNaverMaps();

  const drawOverlays = () => {
    if (!map.current || !overlayMapRef) return;

    const mapBounds = map.current.getBounds();

    overlayMapRef.current.forEach((overlay, id) => {
      const overlayPosition = overlay.getPosition();
      const isMapBounds = mapBounds.hasPoint(overlayPosition);

      if (isMapBounds && !overlay.getMap()) {
        console.log(!!overlay.getMap(), id);
        overlay.setMap(map.current);
      } else if (!isMapBounds && overlay.getMap()) {
        overlay.setMap(null);
      }
    });
  };

  const registerOverlay = (id: string, overlay: ReactOverlayView) => {
    overlayMapRef.current.set(id, overlay);
    drawOverlays();
  };

  const unregisterOverlay = (id: string) => {
    const overlay = overlayMapRef.current.get(id);
    drawOverlays();

    if (overlay) {
      overlay.setMap(null);
      overlayMapRef.current.delete(id);
    }
  };

  useEffect(() => {
    if (!map.current) return;

    drawOverlays();

    const listeners = [
      map.current.addListener('dragend', drawOverlays),
      map.current.addListener('zoom_changed', drawOverlays),
    ];

    return () => {
      navermaps.Event.removeListener(listeners);
    };
  }, [drawOverlays]);

  return (
    <OverlayHandlersContext value={{ registerOverlay, unregisterOverlay }}>
      <OverlayContext value={overlayMapRef.current}>{children}</OverlayContext>
    </OverlayHandlersContext>
  );
}
