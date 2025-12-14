import { useEffect } from 'react';
import { useMapUrlState } from './useMapUrlState';
import { useSearchMachine } from './useSearchMachine';
import { isEqualCoord, isValidCoord } from '@shared/lib';

interface UseSyncMapSnapshotWithUrlOptions {
  mapRef?: React.RefObject<naver.maps.Map | null>;
}

/**
 * URL map 상태(center/zoomLevel)를 로컬 mapSnapshot과 실제 지도 인스턴스에 반영한다.
 *
 * @description
 * - URL → mapSnapshot 단방향 동기화용.
 * - center/zoomLevel이 URL에서 변경되어 돌아올 때 로컬 스냅샷이 뒤처지지 않도록 보정한다.
 * - 동일 값이면 no-op으로 돌려 루프를 방지한다.
 */
export function useSyncMapSnapshotWithUrl({ mapRef }: UseSyncMapSnapshotWithUrlOptions = {}) {
  const { center, zoomLevel } = useMapUrlState();
  const { mapSnapshot, updateMapSnapshot } = useSearchMachine();

  useEffect(() => {
    if (!isValidCoord(center)) return;
    if (typeof zoomLevel !== 'number') return;

    const centerChanged = !isEqualCoord(mapSnapshot.center, center);
    const zoomChanged = mapSnapshot.zoom !== zoomLevel;

    if (!centerChanged && !zoomChanged) return;

    updateMapSnapshot({
      center,
      zoom: zoomLevel,
      viewportBounds: mapSnapshot.viewportBounds,
    });

    if (!mapRef?.current) return;

    const nextCenter = new naver.maps.LatLng(center.lat, center.lng);

    if (centerChanged) {
      mapRef.current.setCenter(nextCenter);
    }

    if (zoomChanged) {
      mapRef.current.setZoom(zoomLevel, true);
    }
  }, [center, zoomLevel, mapSnapshot.center, mapSnapshot.zoom, mapSnapshot.viewportBounds, mapRef, updateMapSnapshot]);
}
