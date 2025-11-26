import type { Bounds } from '@shared/types';
import { isValidCoord } from '@shared/lib';

/**
 * Bounds가 유효한지 확인합니다.
 * @param bounds
 */
export function isValidBounds(bounds?: Bounds | null): bounds is Bounds {
  if (!bounds) return false;
  return isValidCoord(bounds.sw) && isValidCoord(bounds.ne);
}

/**
 * 두 Bounds가 오차 범위 내에서 동일한지 비교합니다.
 * @param first
 * @param second
 * @param epsilon
 */
export function isEqualBounds(first: Bounds | null, second: Bounds | null, epsilon = 1e-6) {
  if (!first || !second) return false;
  return (
    Math.abs(first.sw.lng - second.sw.lng) < epsilon &&
    Math.abs(first.sw.lat - second.sw.lat) < epsilon &&
    Math.abs(first.ne.lng - second.ne.lng) < epsilon &&
    Math.abs(first.ne.lat - second.ne.lat) < epsilon
  );
}
