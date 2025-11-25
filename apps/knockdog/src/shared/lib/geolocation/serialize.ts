interface SerializeCoordsOptions {
  /** 좌표 순서 */
  order?: 'lnglat' | 'latlng';
}

/**
 * 좌표 객체를 문자열로 직렬화합니다.
 * @default options.order = 'latlng'
 * @returns lat,lng 또는 lng,lat
 */
export function serializeCoords(
  coord?: { lat: number; lng: number } | null,
  options: SerializeCoordsOptions = {}
): string {
  const { order = 'latlng' } = options;

  if (!coord || typeof coord.lat !== 'number' || typeof coord.lng !== 'number') return 'pending-ref';

  return order === 'latlng' ? `${coord.lat},${coord.lng}` : `${coord.lng},${coord.lat}`;
}
