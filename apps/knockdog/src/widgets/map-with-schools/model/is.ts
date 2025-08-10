export const isValidBounds = (bounds: naver.maps.LatLngBounds | null): bounds is naver.maps.LatLngBounds => {
  return bounds !== null && typeof bounds.getSW === 'function' && typeof bounds.getNE === 'function';
};

export const isValidCoord = (coord: unknown): coord is { lat: number; lng: number } => {
  if (coord == null || typeof coord !== 'object') return false;

  const { lat, lng } = coord as Record<string, unknown>;
  return typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng);
};

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

export function isSameBounds(first: naver.maps.LatLngBounds | null, second: naver.maps.LatLngBounds | null) {
  if (!first || !second) return false;
  const firstSw = first.getSW();
  const firstNe = first.getNE();
  const secondSw = second.getSW();
  const secondNe = second.getNE();
  return firstSw.x === secondSw.x && firstSw.y === secondSw.y && firstNe.x === secondNe.x && firstNe.y === secondNe.y;
}
