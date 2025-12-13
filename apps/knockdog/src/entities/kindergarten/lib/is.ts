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
