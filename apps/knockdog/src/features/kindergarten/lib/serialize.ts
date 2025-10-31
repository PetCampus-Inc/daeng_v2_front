// TODO: entities에 위치해야할 지 확인 필요

import type { FilterOption } from '@entities/kindergarten';

export function serializeCoords(coord?: { lat: number; lng: number } | null): string {
  if (!coord || typeof coord.lat !== 'number' || typeof coord.lng !== 'number') return 'pending-ref';
  return `${coord.lng},${coord.lat}`;
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
