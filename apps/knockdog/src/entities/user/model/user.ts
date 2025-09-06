/** 유저 */
interface User {
  status: UserStatus;
  nickname: string;
  profileImageUrl: string;
  addressList: UserAddress[];
  // TODO: 날짜 타입 어떻게 할지 논의 필요
}

/** 유저 상태 */
const USER_STATUS = {
  /** 활동중인 유저 */
  ACTIVE: 'ACTIVE',
  /** 탈퇴한 유저 */
  WITHDRAWN: 'WITHDRAWN',
} as const;

type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/** 주소 */
interface UserAddress {
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
const USER_ADDRESS_TYPE = {
  /** 자택 */
  HOME: 'HOME',
  /** 직장 */
  WORK: 'WORK',
  /** 기타 */
  OTHER: 'OTHER',
} as const;

type UserAddressType = (typeof USER_ADDRESS_TYPE)[keyof typeof USER_ADDRESS_TYPE];

export { USER_STATUS, USER_ADDRESS_TYPE, type User, type UserStatus, type UserAddress, type UserAddressType };
