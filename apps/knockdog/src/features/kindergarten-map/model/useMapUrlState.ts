import { useCallback } from 'react';
import { createParser, parseAsInteger, useQueryStates } from 'nuqs';
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
 * MapSnapshot(지도상태) URL 상태를 관리하는 훅
 *
 * @description
 * ✅ useQueryStates를 사용하여 지도 관련 URL 파라미터를 한 번에 관리
 * - center와 zoomLevel 동시 업데이트 시 배칭 처리로 URL 업데이트 1회만 발생
 * - 드래그/줌 인터랙션에서 두 값을 원자적으로 업데이트
 *
 * 관리하는 URL 파라미터:
 * - center: 지도 중심 좌표
 * - zoomLevel: 지도 줌레벨
 */
export function useMapUrlState() {
  const [mapState, setMapState] = useQueryStates(
    {
      center: CENTER_PARSER,
      zoomLevel: parseAsInteger,
    },
    {
      history: 'push',
    }
  );

  const { center, zoomLevel } = mapState;

  /**
   * 개별 center 업데이트
   */
  const setCenter = useCallback(
    (next: Coord) => {
      setMapState({ center: next });
    },
    [setMapState]
  );

  /**
   * 개별 zoomLevel 업데이트
   */
  const setZoomLevel = useCallback(
    (next: number) => {
      setMapState({ zoomLevel: next });
    },
    [setMapState]
  );

  /**
   * center와 zoomLevel을 동시에 업데이트 (배칭)
   *
   * @description
   * 드래그/줌 종료 시 두 값을 원자적으로 업데이트합니다.
   * useQueryStates의 배칭 기능으로 한 번의 URL 업데이트로 처리됩니다.
   *
   * @param nextCenter - 새로운 중심 좌표
   * @param nextZoomLevel - 새로운 줌레벨
   */
  const setCenterAndZoom = useCallback(
    (nextCenter: Coord, nextZoomLevel: number) => {
      setMapState({
        center: nextCenter,
        zoomLevel: nextZoomLevel,
      });
    },
    [setMapState]
  );

  return {
    center,
    zoomLevel,
    setCenter,
    setZoomLevel,
    setCenterAndZoom,
  };
}
