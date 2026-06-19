import { BUSINESS_VERIFICATION_ERROR_CODE } from './businessVerificationError';

/** @todo BE API 연동 후 삭제 — 인증 stub 테스트용 사업자번호 */
export const businessVerificationDevStub = Object.freeze({
  /** 인증 성공 */
  success: '1234567890',
  /** 중복 사업자번호 */
  duplicate: '1111111111',
  /** 사업자번호 형식 오류 */
  invalidFormat: '2222222222',
  /** 휴/폐업 사업자 */
  closedOrSuspended: '3333333333',
  /** 외부 API/통신 장애 */
  temporary: '4444444444',
});

export const devStubErrorByBizNo = Object.freeze({
  [businessVerificationDevStub.duplicate]: BUSINESS_VERIFICATION_ERROR_CODE.DUPLICATE,
  [businessVerificationDevStub.invalidFormat]: BUSINESS_VERIFICATION_ERROR_CODE.INVALID_FORMAT,
  [businessVerificationDevStub.closedOrSuspended]: BUSINESS_VERIFICATION_ERROR_CODE.CLOSED_OR_SUSPENDED,
  [businessVerificationDevStub.temporary]: 'UNKNOWN_ERROR',
} as const);
