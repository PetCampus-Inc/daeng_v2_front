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

  // FIXME: 좌표가 유효하지 않은 경우 처리 확인 필요.
  // 유효하지 않은 좌표에 대해 'pending-ref' 문자열을 반환합니다. 이 값이 실수로 API에 전달되면 예상치 못한 동작을 유발할 수 있습니다. 호출부에서 반환값 검증이 필요합니다.
  if (!coord || typeof coord.lat !== 'number' || typeof coord.lng !== 'number') return 'pending-ref';

  return order === 'latlng' ? `${coord.lat},${coord.lng}` : `${coord.lng},${coord.lat}`;
}
