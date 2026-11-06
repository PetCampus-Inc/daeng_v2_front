/**
 * 위치 에러 코드
 */
const LOCATION_ERROR_CODES = {
  /** 위치 권한 거부 */
  PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  /** 위치 서비스(GPS) OFF */
  SERVICE_DISABLED: 'LOCATION_SERVICE_DISABLED',
  /** 위치 획득 불가 (실내, 지하 등) */
  UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  /** 위치 획득 타임아웃 */
  TIMEOUT: 'LOCATION_TIMEOUT',
} as const;

export { LOCATION_ERROR_CODES };
