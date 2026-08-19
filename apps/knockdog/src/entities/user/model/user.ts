import { USER_STATUS, USER_ADDRESS_TYPE, WITHDRAW_REASON_TYPE } from './constant/user';

/** 유저 */
interface User {
  userId: string;
  status: UserStatus;
  nickname: string;
  profileImageUrl: string;
  addresses: UserAddress[];
  // TODO: 날짜 타입 어떻게 할지 논의 필요
}

/** 유저 상태 */
type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/** 주소 */
interface UserAddress {
  id: string;
  type: UserAddressType;
  alias?: string;
  roadAddress: string;
  address: string;
  detail?: string;
  lat: number;
  lng: number;
}

/** 주소 타입 */
type UserAddressType = (typeof USER_ADDRESS_TYPE)[keyof typeof USER_ADDRESS_TYPE];

/** 탈퇴 사유 타입 */
type WithdrawReasonType = (typeof WITHDRAW_REASON_TYPE)[keyof typeof WITHDRAW_REASON_TYPE];

export {
  USER_STATUS,
  USER_ADDRESS_TYPE,
  WITHDRAW_REASON_TYPE,
  type User,
  type UserStatus,
  type UserAddress,
  type UserAddressType,
  type WithdrawReasonType,
};
