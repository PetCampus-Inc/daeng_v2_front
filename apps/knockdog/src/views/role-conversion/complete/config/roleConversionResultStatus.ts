export const RESULT_STATUS = Object.freeze({
  SUCCESS: 'success',
  /** E-04: 이미 원장 권한이 부여된 사업자번호 */
  DUPLICATE: 'duplicate',
  /** E-05: 휴업/폐업/미등록 사업자번호 */
  CLOSED_OR_SUSPENDED: 'closed-or-suspended',
  /** E-06, E-09: API/네트워크 오류 등 */
  TEMPORARY: 'temporary',
} as const);

export type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS];

export const RESULT_STATUS_VALUES = Object.values(RESULT_STATUS) as ResultStatus[];
