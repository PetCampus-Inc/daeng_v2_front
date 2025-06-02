import { MapInstanceContext } from '../contexts';
import { use } from 'react';

export function useNaverMap() {
  const map = use(MapInstanceContext);

  const moveTo = (position: naver.maps.Coord | naver.maps.CoordLiteral) => {
    if (map.current) map.current.setCenter(new naver.maps.LatLng(position));
  };

  const zoomTo = (zoom: number) => {
    if (map.current) map.current.setZoom(zoom);
  };

  const zoomIn = (delta: number = 1) => {
    if (!map.current) return;
    const zoom = map.current.getZoom();
    map.current.setZoom(zoom + delta);
  };

  const zoomOut = (delta: number = 1) => {
    if (!map.current) return;
    const zoom = map.current.getZoom();
    map.current.setZoom(zoom - delta);
  };

  return { moveTo, zoomTo, zoomIn, zoomOut };
}
