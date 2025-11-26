import type { FilterOption } from '../config/filter-options';
import { isValidBounds } from './is';
import type { Bounds } from '@shared/types';

/**
 * 지도 경계 객체를 문자열로 직렬화합니다.
 * @returns sw.lng,sw.lat,ne.lng,ne.lat
 */
export function serializeBounds(bounds?: Bounds | null): string | undefined {
  if (!isValidBounds(bounds)) return undefined;
  return `${bounds.sw.lng},${bounds.sw.lat},${bounds.ne.lng},${bounds.ne.lat}`;
}

/**
 * 필터 옵션을 문자열로 직렬화합니다.
 * @returns filter1,filter2,filter3
 */
export function serializeFilters(filters?: FilterOption[]): string | undefined {
  if (!filters || filters.length === 0) return undefined;
  return filters.join(',');
}
