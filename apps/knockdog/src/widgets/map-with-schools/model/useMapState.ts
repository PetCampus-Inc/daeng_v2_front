import { createParser, useQueryState } from 'nuqs';
import { useState } from 'react';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM_LEVEL } from '../config';

const CENTER_PARSER = createParser<{ lat: number; lng: number }>({
  parse: (value: string) => {
    if (!value) return null;
    const [latRaw, lngRaw] = value.split(',');
    const lat = Number.parseFloat(latRaw ?? '');
    const lng = Number.parseFloat(lngRaw ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  },
  serialize: (value) => `${value.lat},${value.lng}`,
  eq: (a, b) => a.lat === b.lat && a.lng === b.lng,
}).withDefault(DEFAULT_MAP_CENTER);

export function useMapState() {
  const [center, setCenter] = useQueryState('center', CENTER_PARSER);
  const [zoomLevel, setZoomLevel] = useQueryState('zoom', {
    defaultValue: DEFAULT_MAP_ZOOM_LEVEL,
    parse: Number,
    serialize: String,
  });
  const [bounds, setBounds] = useState<naver.maps.LatLngBounds | null>(null);

  return {
    center,
    bounds,
    zoomLevel,
    setCenter,
    setZoomLevel,
    setBounds,
  };
}
