/** 유저 상태 */
export const USER_STATUS = {
  /** 활동중인 유저 */
  ACTIVE: 'ACTIVE',
  /** 탈퇴한 유저 */
  WITHDRAWN: 'WITHDRAWN',
} as const;

/** 주소 타입 */
export const USER_ADDRESS_TYPE = {
  /** 자택 */
  HOME: 'HOME',
  /** 직장 */
  WORK: 'WORK',
  /** 기타 */
  OTHER: 'OTHER',
} as const;

/** 주소 타입 한글 */
export const USER_ADDRESS_TYPE_KR = {
  HOME: '집',
  WORK: '회사',
  OTHER: '기타',
} as const;
