import { SEND_EMAIL_RESULT_CODE, VERIFICATION_STATUS } from '../constant/email';

/** 인증 이메일 전송 상태 */
interface SendEmailStatus {
  /** 인증 시도 횟수 */
  attemptCount: number;
  /** 최대 인증 시도 횟수 */
  maxAttempts: number;
  /** 인증 만료 일시 */
  verificationExpiryDate: number[];
}

/** 인증 이메일 전송 결과 코드 */
type SendEmailResultCode = (typeof SEND_EMAIL_RESULT_CODE)[keyof typeof SEND_EMAIL_RESULT_CODE];

/** 이메일 인증 상태 */
type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export { type SendEmailStatus, type SendEmailResultCode, type VerificationStatus };
