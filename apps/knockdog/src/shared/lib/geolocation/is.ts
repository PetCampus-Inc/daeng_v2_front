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
export function isEqualCoord(
  first: { lat?: number; lng?: number } | null,
  second: { lat?: number; lng?: number } | null,
  epsilon = 1e-6
) {
  if (!first || !second) return false;
  if (first.lat == null || second.lat == null) return false;
  if (first.lng == null || second.lng == null) return false;

  return Math.abs(first.lat - second.lat) < epsilon && Math.abs(first.lng - second.lng) < epsilon;
}
