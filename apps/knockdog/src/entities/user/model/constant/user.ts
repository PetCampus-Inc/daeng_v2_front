/** 유저 상태 */
const USER_STATUS = {
  /** 활동중인 유저 */
  ACTIVE: 'ACTIVE',
  /** 탈퇴한 유저 */
  WITHDRAWN: 'WITHDRAWN',
} as const;

/** 주소 타입 한글 */
const USER_ADDRESS_TYPE_KR = {
  HOME: '집',
  WORK: '직장',
  // OTHER: '기타',
} as const;

/** 주소 타입 */
const USER_ADDRESS_TYPE = {
  /** 자택 */
  HOME: 'HOME',
  /** 직장 */
  WORK: 'WORK',
  /** 기타 */
  // OTHER: 'OTHER',
} as const;

/** 탈퇴 사유 타입 */
const WITHDRAW_REASON_TYPE = {
  /** 정보가 부정확해요 */
  INACCURATE_INFO: 'INACCURATE_INFO',
  /** 탐색 경험이 불편해요 */
  POOR_UX: 'POOR_UX',
  /** 필요한 기능이 부족해요 */
  MISSING_FEATURE: 'MISSING_FEATURE',
  /** 기타 */
  OTHER: 'OTHER',
} as const;

export { USER_STATUS, USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR, WITHDRAW_REASON_TYPE };
