import { createParser, parseAsInteger, useQueryState } from 'nuqs';
import type { Coord } from '@shared/types';

const CENTER_PARSER = createParser<{ lat: number; lng: number }>({
  parse: (value: string) => {
    if (!value) return null;
    const [latRaw, lngRaw] = value.split(',');
    const lat = Number.parseFloat(latRaw ?? '');
    const lng = Number.parseFloat(lngRaw ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  },
  serialize: (value: Coord) => `${value.lat},${value.lng}`,
  eq: (a: Coord, b: Coord) => a.lat === b.lat && a.lng === b.lng,
});
/**
 * Kindergarten Map URL 상태를 관리하는 훅
 *
 * @description
 * - center: 지도 중심 좌표
 * - zoomLevel: 지도 줌레벨
 */
export function useMapUrlState() {
  const [center, setCenter] = useQueryState('center', CENTER_PARSER);
  const [zoomLevel, setZoomLevel] = useQueryState('zoom', parseAsInteger);

  return {
    center,
    zoomLevel,
    setCenter,
    setZoomLevel,
  };
}
