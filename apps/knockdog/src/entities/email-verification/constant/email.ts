/** 인증 이메일 전송 결과 코드 */
const SEND_EMAIL_RESULT_CODE = {
  /** 인증 성공 */
  SUCCESS: 'SUCCESS',
  /** 최대 인증 시도 횟수 초과 */
  MAX_VERIFICATION_ATTEMPTS: 'MAX_VERIFICATION_ATTEMPTS',
  /** 유효하지 않은 이메일 주소 */
  INVALID_EMAIL: 'INVALID_EMAIL',
  /** 외부 서버 오류 */
  EXTERNAL_SERVER_ERROR: 'EXTERNAL_SERVER_ERROR',
} as const;

/** 이메일 인증 상태 */
const VERIFICATION_STATUS = {
  /** 인증 대기 */
  PENDING: 'PENDING',
  /** 인증 성공 */
  SUCCESS: 'SUCCESS',
  /** 인증 실패 */
  FAILED: 'FAILED',
} as const;

export { SEND_EMAIL_RESULT_CODE, VERIFICATION_STATUS };
