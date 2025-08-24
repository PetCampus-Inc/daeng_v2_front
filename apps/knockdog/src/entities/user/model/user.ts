import { Address } from '@shared/types';

/** 유저 */
export interface User {
  status: UserStatus;
  nickname: string;
  profileImageUrl: string;
  addresses: UserAddress[];
  // TODO: 날짜 타입 어떻게 할지 논의 필요
}

/** 유저 상태 */
export const USER_STATUS = {
  /** 활동중인 유저 */
  ACTIVE: 'ACTIVE',
  /** 탈퇴한 유저 */
  WITHDRAWN: 'WITHDRAWN',
} as const;

/** 유저 상태 */
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/** 주소 */
export interface UserAddress extends Address {
  type: UserAddressType;
  alias: string;
}

export const USER_ADDRESS_TYPE_KR = {
  HOME: '집',
  WORK: '회사',
  OTHER: '기타',
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

/** 주소 타입 */
export type UserAddressType = (typeof USER_ADDRESS_TYPE)[keyof typeof USER_ADDRESS_TYPE];
