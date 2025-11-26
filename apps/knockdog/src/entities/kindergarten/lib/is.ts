/**
 * 네이버 지도 Bounds가 유효한 LatLngBounds인지 확인합니다.
 * @param bounds
 */
export const isValidLatLngBounds = (bounds?: naver.maps.Bounds | null): bounds is naver.maps.LatLngBounds => {
  if (!bounds) return false;
  return (
    bounds instanceof naver.maps.LatLngBounds &&
    typeof bounds.getSW === 'function' &&
    typeof bounds.getNE === 'function'
  );
};

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
