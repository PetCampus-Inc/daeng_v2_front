import { api, ApiResponse } from '@shared/api';
import { User, UserAddress, WithdrawReasonType } from '../model/user';
import { USER_ADDRESS_TYPE } from '../model/constant/user';

interface RegisterUserRequest {
  nickname: string;
  profileImage: string;
  addresses: Omit<UserAddress, 'id'>[];
}

interface WithdrawRequest {
  reasonType: WithdrawReasonType;
  detail?: string;
}

/** `POST` - 회원 가입 API */
const postRegisterUser = async (request: RegisterUserRequest) => {
  return await api
    .post(`user/register`, {
      json: request,
    })
    .json<ApiResponse<User>>();
};

/** `POST` - 회원 탈퇴 API */
const postWithdraw = async (request: WithdrawRequest) => {
  return await api.post(`user/withdraw`, { json: request });
};

type GuardianProfileGender = 'MALE' | 'FEMALE';

interface GuardianProfile {
  guardianName?: string | null;
  gender?: GuardianProfileGender | null;
  phoneNumber?: string | null;
  guardianAddressDetail?: string | null;
  emergencyPhoneNumber?: string | null;
}

interface UserInfo extends Omit<User, 'profileImageUrl'>, GuardianProfile {
  profileImage: string;
  infoRcvEmail: string;
  loginProvider?: SocialLoginProvider | null;
}

// WORK는 더 이상 쓰지 않는다. 과거(2026-08-21 이전)에 WORK로 저장된 레거시 주소가
// 백엔드에 남아있을 수 있어, 응답에서 WORK가 오면 OTHER로 정규화한다.
const toAppAddressType = (type: string): UserAddress['type'] =>
  type === 'WORK' ? USER_ADDRESS_TYPE.OTHER : (type as UserAddress['type']);

function normalizeAddressDetails<T extends { addresses: UserAddress[] }>(userInfo: T): T {
  return {
    ...userInfo,
    addresses: userInfo.addresses.map(({ addressDetail, detail, ...address }) => ({
      ...address,
      type: toAppAddressType(address.type),
      detail: detail?.trim() || addressDetail?.trim() || undefined,
    })),
  };
}

function normalizeUserInfoResponse(response: ApiResponse<UserInfo>): ApiResponse<UserInfo> {
  return { ...response, data: normalizeAddressDetails(response.data) };
}

/** API 사용자 정보 응답을 앱 전역 사용자 모델로 변환한다. */
const toUser = ({ profileImage, ...userInfo }: UserInfo): User => ({
  ...normalizeAddressDetails(userInfo),
  profileImageUrl: profileImage,
});

/** `GET` - 유저 정보 조회 API */
const getUserInfo = async () => {
  const response = await api.get(`mypage/getUserInfo`).json<ApiResponse<UserInfo>>();
  return normalizeUserInfoResponse(response);
};

interface UpdateGuardianProfileRequest {
  name: string;
  gender: GuardianProfileGender;
  phoneNumber: string;
  emergencyPhoneNumber: string;
  address: GuardianProfileAddress;
  addressDetail: string;
}

interface GuardianProfileAddress {
  pnu?: string;
  address: string;
  roadAddress: string;
}

/** `POST` - 보호자 프로필 등록 및 수정 API */
const postUpdateGuardianProfile = async (request: UpdateGuardianProfileRequest) => {
  const response = await api.post(`mypage/updateGuardianProfile`, { json: request }).json<ApiResponse<UserInfo>>();
  return normalizeUserInfoResponse(response);
};

/** `POST` - 유저 정보 수정 API */
const postUpdateUserNickname = async (nickname: string) => {
  return await api.post(`mypage/updateNickname`, { json: { nickname } }).json<ApiResponse<void>>();
};

/** `POST` - 유저 정보 수신 이메일 수정 API */
const postUpdateUserEmail = async (userEmail: string) => {
  return await api.post(`mypage/updateInfoRcvEmail`, { json: { userEmail } }).json<ApiResponse<void>>();
};

type OwnerKindergartenType = 'MANUAL' | 'SELECTED';

interface OwnerRole {
  isOwner: boolean;
  kindergartenType: OwnerKindergartenType | null;
  schoolId: number | null;
  /** BE 내부 유치원 PK. basic/main API 조회 키(place id)가 아님 */
  kindergartenId: number | null;
  /**
   * SELECTED 유치원 place id. `kindergarten/basic·main/{id}` 조회 키.
   */
  placeId: number | null;
  kindergartenName: string | null;
  kindergartenAddress: string | null;
  representativeName: string | null;
  representativePhoneNumber: string | null;
}

/** `GET` - 원장 권한 확인 API (로그인 세션 기준으로 원장 여부 + 유치원/대표자 상세 조회) */
const getOwnerRole = async () => {
  return await api.get(`owner/role`).json<ApiResponse<OwnerRole>>();
};

type SocialLoginProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

interface OwnerMypageSummary {
  ownerId: string;
  ownerName: string;
  ownerProfileImageUrl: string | null;
  /** 현재 구현상 항상 true (비원장은 403) */
  isOwner: boolean;
  loginProvider: SocialLoginProvider;
  loginEmail: string;
  kindergartenId: number | null;
  kindergartenName: string | null;
  kindergartenAddress: string | null;
  /** 현재 구현상 항상 null */
  kindergartenRepresentativeImageUrl: string | null;
  canSwitchToGuardian: boolean;
  canReleaseOperationPermission: boolean;
}

/** `GET` - 원장 마이페이지 요약 조회 API (원장 전용, 비원장 403) */
const getOwnerMypageSummary = async () => {
  return await api.get(`owner/mypage/summary`).json<ApiResponse<OwnerMypageSummary>>();
};

/** BE `GET /owner/mypage/profile` 응답 data */
interface OwnerProfile {
  representativeName: string;
  representativePhoneNumber: string;
  loginEmail: string;
  profileImageUrl: string | null;
}

/** `GET` - 원장 프로필 조회 API (원장 전용, 비원장 403) */
const getOwnerProfile = async () => {
  return await api.get(`owner/mypage/profile`).json<ApiResponse<OwnerProfile>>();
};

interface PutOwnerProfileRequest {
  representativeName: string;
  representativePhoneNumber: string;
  profileImageUrl: string;
}

/** `PUT` - 원장 프로필 수정 API (원장 전용, 비원장 403) */
const putOwnerProfile = async (request: PutOwnerProfileRequest) => {
  return await api
    .put(`owner/mypage/profile`, { json: request })
    .json<ApiResponse<null>>();
};

export {
  type RegisterUserRequest,
  type WithdrawRequest,
  type UserInfo,
  type GuardianProfile,
  type GuardianProfileGender,
  type GuardianProfileAddress,
  type UpdateGuardianProfileRequest,
  type OwnerRole,
  type OwnerKindergartenType,
  type OwnerMypageSummary,
  type OwnerProfile,
  type PutOwnerProfileRequest,
  type SocialLoginProvider,
  postRegisterUser,
  postWithdraw,
  getUserInfo,
  toUser,
  postUpdateGuardianProfile,
  postUpdateUserNickname,
  postUpdateUserEmail,
  getOwnerRole,
  getOwnerMypageSummary,
  getOwnerProfile,
  putOwnerProfile,
};
