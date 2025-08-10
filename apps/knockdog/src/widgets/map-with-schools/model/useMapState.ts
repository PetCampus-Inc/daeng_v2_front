import { createParser, useQueryState } from 'nuqs';
import { useState } from 'react';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config';

const createCenterParser = () =>
  createParser({
    parse: (value: string) => {
      const [lat, lng] = value.split(',').map(Number);
      return { lat, lng };
    },
    serialize: (value) => `${value.lat},${value.lng}`,
  });

export function useMapState() {
  const [center, setCenter] = useQueryState('center', createCenterParser());
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
