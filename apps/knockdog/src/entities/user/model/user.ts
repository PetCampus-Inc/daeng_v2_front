import { USER_STATUS, USER_ADDRESS_TYPE } from './constants/user';

/** 유저 */
export interface User {
  status: UserStatus;
  nickname: string;
  profileImageUrl: string;
  addressList: UserAddress[];
  // TODO: 날짜 타입 어떻게 할지 논의 필요
}

/** 유저 상태 */
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/** 주소 */
export interface UserAddress {
  id: string;
  type: UserAddressType;
  alias: string;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  lat: number;
  lng: number;
}

/** 주소 타입 */
export type UserAddressType = (typeof USER_ADDRESS_TYPE)[keyof typeof USER_ADDRESS_TYPE];
