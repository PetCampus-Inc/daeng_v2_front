import { isValidLatLngBounds, type FilterOption } from '@entities/kindergarten';

/**
 * 지도 경계 객체를 문자열로 직렬화합니다.
 * @returns sw.lng,sw.lat,ne.lng,ne.lat
 */
export function serializeBounds(bounds: naver.maps.LatLngBounds | null): string {
  if (!isValidLatLngBounds(bounds)) return 'pending-bounds';
  const sw = bounds.getSW();
  const ne = bounds.getNE();
  return `${sw.x},${sw.y},${ne.x},${ne.y}`;
}

/**
 * 필터 옵션을 문자열로 직렬화합니다.
 * @returns filter1,filter2,filter3
 */
export function serializeFilters(filters?: FilterOption[]) {
  if (!filters) return;
  return filters.join(',');
}
