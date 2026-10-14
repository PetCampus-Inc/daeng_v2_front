const COMMON_ERROR_CODE = {
  /** 요청 값 검증 실패 (필수 값 누락, 길이·개수 초과 등) */
  INVALID_REQUEST_VALUE: 'COMMON-400-1',
  /** 같은 Idempotency-Key로 다른 내용을 보냄 */
  REQUEST_CONFLICT: 'COMMON-409-1',
  /** 필수 파라미터 누락 (Idempotency-Key 헤더 등) */
  MISSING_PARAMETER: 'PARAM-400-1',
} as const;

export { COMMON_ERROR_CODE };
