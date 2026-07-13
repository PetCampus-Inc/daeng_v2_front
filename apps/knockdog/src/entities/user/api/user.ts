import { api, ApiResponse } from '@shared/api';
import { User, UserAddress, WithdrawReasonType } from '../model/user';

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

interface UserInfo extends User {
  infoRcvEmail: string;
}

/** `GET` - 유저 정보 조회 API */
const getUserInfo = async () => {
  return await api.get(`mypage/getUserInfo`).json<ApiResponse<UserInfo>>();
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
  /** 유치원 place id. SELECTED 유치원 basic API(`kindergarten/basic/{id}`) 조회 키. schoolId와 별개 */
  kindergartenId: number | null;
  kindergartenName: string | null;
  kindergartenAddress: string | null;
  representativeName: string | null;
  representativePhoneNumber: string | null;
}

/** `GET` - 원장 권한 확인 API (로그인 세션 기준으로 원장 여부 + 유치원/대표자 상세 조회) */
const getOwnerRole = async () => {
  return await api.get(`owner/role`).json<ApiResponse<OwnerRole>>();
};

export {
  type RegisterUserRequest,
  type WithdrawRequest,
  type UserInfo,
  type OwnerRole,
  type OwnerKindergartenType,
  postRegisterUser,
  postWithdraw,
  getUserInfo,
  postUpdateUserNickname,
  postUpdateUserEmail,
  getOwnerRole,
};
