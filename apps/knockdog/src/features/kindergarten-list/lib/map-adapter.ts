import type { Bounds } from '@shared/types';

/**
 * naver.maps.LatLngBounds를 Bounds 추상 타입으로 변환합니다.
 */
export function toBounds(naverBounds: naver.maps.LatLngBounds | null | undefined): Bounds | null {
  if (!naverBounds) return null;

  const sw = naverBounds.getSW();
  const ne = naverBounds.getNE();

  return {
    sw: { lat: sw.y, lng: sw.x },
    ne: { lat: ne.y, lng: ne.x },
  };
}

/**
 * naver.maps.LatLngBounds가 유효한지 확인합니다.
 */
export function isValidLatLngBounds(bounds?: naver.maps.Bounds | null): bounds is naver.maps.LatLngBounds {
  if (!bounds) return false;
  return (
    bounds instanceof naver.maps.LatLngBounds &&
    typeof bounds.getSW === 'function' &&
    typeof bounds.getNE === 'function'
  );
}
