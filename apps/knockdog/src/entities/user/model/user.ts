import { USER_STATUS, USER_ADDRESS_TYPE } from './constant/user';

/** 유저 */
interface User {
  id: string;
  status: UserStatus;
  nickname: string;
  profileImageUrl: string;
  addressList: UserAddress[];
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
  lat: number;
  lng: number;
}

/** 주소 타입 */
type UserAddressType = (typeof USER_ADDRESS_TYPE)[keyof typeof USER_ADDRESS_TYPE];

export { USER_STATUS, USER_ADDRESS_TYPE, type User, type UserStatus, type UserAddress, type UserAddressType };
