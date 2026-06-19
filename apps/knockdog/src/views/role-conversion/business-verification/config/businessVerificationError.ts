export const BUSINESS_VERIFICATION_ERROR_CODE = Object.freeze({
  DUPLICATE: 'DUPLICATE_BUSINESS_NUMBER',
  INVALID_FORMAT: 'INVALID_BUSINESS_NUMBER_FORMAT',
  CLOSED_OR_SUSPENDED: 'CLOSED_OR_SUSPENDED_BUSINESS',
} as const);

export const businessVerificationError = Object.freeze({
  duplicateLine1: '이미 등록된 사업자등록번호입니다.',
  duplicateLine2: '고객센터로 문의해 주세요',
  invalidFormat: '올바른 숫자를 입력해 주세요',
  closedOrSuspended: '휴업 또는 폐업 상태인 번호는 인증할 수 없습니다',
  temporaryLine1: '일시적인 오류가 발생했습니다.',
  temporaryLine2: '잠시 후 다시 시도해 주세요',
});
