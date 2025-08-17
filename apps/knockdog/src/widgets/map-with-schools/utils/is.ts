/**
 * 네이버 지도 Bounds가 유효한지 확인합니다.
 * @param bounds
 */
export const isValidBounds = (bounds: naver.maps.LatLngBounds | null): bounds is naver.maps.LatLngBounds => {
  return bounds !== null && typeof bounds.getSW === 'function' && typeof bounds.getNE === 'function';
};

/**
 * 좌표가 유효한 위/경도인지 확인합니다.
 * @param coord
 */
export const isValidCoord = (coord: unknown): coord is { lat: number; lng: number } => {
  if (coord == null || typeof coord !== 'object') return false;

  const { lat, lng } = coord as Record<string, unknown>;
  return typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng);
};

/**
 * 두 좌표가 오차 범위 내에서 동일한지 비교합니다.
 * @param first
 * @param second
 * @param epsilon
 */
export function isSameCoord(
  first: { lat?: number; lng?: number } | null,
  second: { lat?: number; lng?: number } | null,
  epsilon = 1e-6
) {
  if (!first || !second) return false;
  if (first.lat == null || second.lat == null) return false;
  if (first.lng == null || second.lng == null) return false;

  return Math.abs(first.lat - second.lat) < epsilon && Math.abs(first.lng - second.lng) < epsilon;
}

/**
 * 두 Bounds가 오차 범위 내에서 동일한지 비교합니다.
 * - Naver Maps v3의 LatLngBounds를 가정합니다.
 * @param first
 * @param second
 * @param epsilon
 */
export function isSameBounds(
  first: naver.maps.LatLngBounds | null,
  second: naver.maps.LatLngBounds | null,
  epsilon = 1e-6
) {
  if (!first || !second) return false;
  const firstSw = first.getSW();
  const firstNe = first.getNE();
  const secondSw = second.getSW();
  const secondNe = second.getNE();
  return (
    Math.abs(firstSw.x - secondSw.x) < epsilon &&
    Math.abs(firstSw.y - secondSw.y) < epsilon &&
    Math.abs(firstNe.x - secondNe.x) < epsilon &&
    Math.abs(firstNe.y - secondNe.y) < epsilon
  );
}
