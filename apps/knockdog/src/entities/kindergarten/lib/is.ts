import type { FilterOption } from '../config/filter-options';
import type { Bounds } from '@shared/types';
import { isValidCoord } from '@shared/lib';
import { BoundsSnapshot } from '@features/kindergarten-map/lib/searchMachine';

/**
 * Bounds가 유효한지 확인합니다.
 * @param bounds
 */
export function isValidBounds(bounds?: Bounds | null): bounds is Bounds {
  if (!bounds) return false;
  return isValidCoord(bounds.sw) && isValidCoord(bounds.ne);
}

export function isValidBoundsSnapshot(bounds?: BoundsSnapshot | null): bounds is BoundsSnapshot {
  if (!bounds) return false;
  return (
    isValidCoord({ lat: bounds.swLat, lng: bounds.swLng }) && isValidCoord({ lat: bounds.neLat, lng: bounds.neLng })
  );
}

/**
 * 두 FilterOption 배열이 동일한지 확인합니다.
 * @param a
 * @param b
 * @returns
 */
export function isEqualFilters(a: FilterOption[], b: FilterOption[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
