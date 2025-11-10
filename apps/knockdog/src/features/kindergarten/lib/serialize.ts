import type { FilterOption } from '@entities/kindergarten';

interface SerializeCoordsOptions {
  /** 좌표 순서 */
  order?: 'lnglat' | 'latlng';
}

/**
 * 좌표 객체를 문자열로 직렬화
 * @param coord - 좌표 객체
 * @param options - 직렬화 옵션
 * @default options.order = 'latlng'
 */
export function serializeCoords(
  coord?: { lat: number; lng: number } | null,
  options: SerializeCoordsOptions = {}
): string {
  const { order = 'latlng' } = options;

  if (!coord || typeof coord.lat !== 'number' || typeof coord.lng !== 'number') return 'pending-ref';

  return order === 'latlng' ? `${coord.lat},${coord.lng}` : `${coord.lng},${coord.lat}`;
}

export function serializeBounds(bounds?: naver.maps.LatLngBounds | null): string {
  if (!bounds || typeof bounds.getSW !== 'function' || typeof bounds.getNE !== 'function') return 'pending-bounds';
  const sw = bounds.getSW();
  const ne = bounds.getNE();
  return `${sw.x},${sw.y},${ne.x},${ne.y}`;
}

export function serializeFilters(filters?: FilterOption[]) {
  if (!filters) return;
  return filters.join(',');
}
