export const VERIFY_OIDC_RESULT_CODE = {
  /** 정상 처리 되었을 때 */
  SUCCESS: 'SUCCESS',
  /** 연동되지 않은 계정 */
  UNLINKED: 'UNLINKED',
  /** 이미 존재하는 이메일 주소 */
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
} as const;

export type VerifyOidcResultCode = (typeof VERIFY_OIDC_RESULT_CODE)[keyof typeof VERIFY_OIDC_RESULT_CODE];
