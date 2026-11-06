import { USER_STATUS, USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR, WITHDRAW_REASON_TYPE } from './constant/user';

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
  addressDetail?: string;
  lat: number;
  lng: number;
}

/** 주소 타입 */
type UserAddressType = (typeof USER_ADDRESS_TYPE)[keyof typeof USER_ADDRESS_TYPE];

/** 탈퇴 사유 타입 */
type WithdrawReasonType = (typeof WITHDRAW_REASON_TYPE)[keyof typeof WITHDRAW_REASON_TYPE];

/** 주소 표시 이름 — 집은 항상 "집" 고정, 그 외는 별칭 우선(없으면 타입 기본값) */
function resolveAddressAlias(type: UserAddressType, alias?: string | null): string {
  if (type === USER_ADDRESS_TYPE.HOME) return USER_ADDRESS_TYPE_KR.HOME;
  return alias || USER_ADDRESS_TYPE_KR[type];
}

/** 저장된 사용자 상태의 레거시 주소 타입을 현재 모델로 이관한다. */
function normalizeUserAddresses(addresses: UserAddress[]): UserAddress[] {
  const normalizedByType = new Map<UserAddressType, UserAddress>();

  for (const address of addresses) {
    const originalType = address.type as string;
    const type = originalType === 'WORK' ? USER_ADDRESS_TYPE.OTHER : (originalType as UserAddressType);
    const normalizedAddress = { ...address, type };
    const existingAddress = normalizedByType.get(type);

    // 레거시 WORK와 현재 OTHER가 공존하면 현재 타입을 우선한다.
    if (!existingAddress || originalType !== 'WORK') {
      normalizedByType.set(type, normalizedAddress);
    }
  }

  return [...normalizedByType.values()];
}

export {
  USER_STATUS,
  USER_ADDRESS_TYPE,
  WITHDRAW_REASON_TYPE,
  normalizeUserAddresses,
  resolveAddressAlias,
  type User,
  type UserStatus,
  type UserAddress,
  type UserAddressType,
  type WithdrawReasonType,
};
