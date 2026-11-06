/**
 * 공통 에러 코드 상수
 *
 * 각 도메인은 별도 파일에서 자체 에러 코드를 정의하는 것을 권장
 */
const COMMON_ERROR_CODES = {
  // 라이프 사이클 및 상태
  BRIDGE_NOT_READY: 'EBRIDGE_NOT_READY', // 초기화 전 호출
  WEBVIEW_NOT_READY: 'EWEBVIEW_NOT_READY', // webview 준비 안됨
  DESTROYED: 'EDESTROYED',

  // request / response
  TIMEOUT: 'ETIMEDOUT',
  REQUEST_NOT_FOUND: 'EREQUEST_NOT_FOUND', // 응답 도착했는데 요청 없음
  DUPLICATE_REQUEST: 'EDUPLICATE_REQUEST', // 동일 id 재요청
  CANCELLED: 'ECANCELLED', // 요청 취소됨 (사용자 취소)

  // 프로토콜
  INVALID_MESSAGE: 'EINVALID_MESSAGE', // message shape 파싱 실패
  INVALID: 'EINVALID',
  UNSUPPORTED_VERSION: 'EUNSUPPORTED_VERSION', // 지원하지 않는 버전

  // 메서드
  METHOD_NOT_FOUND: 'EMETHOD_NOT_FOUND', // 존재하지 않는 bridge method

  // 권한
  PERMISSION: 'EPERMISSION',
  ACCESS: 'EACCES',
  UNAVAILABLE: 'EUNAVAILABLE',

  UNKNOWN: 'EUNKNOWN',
} as const;

type CommonErrorCode = (typeof COMMON_ERROR_CODES)[keyof typeof COMMON_ERROR_CODES];

export { COMMON_ERROR_CODES, type CommonErrorCode };
