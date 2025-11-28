import { api, ApiResponse } from '@shared/api';
import { User, UserAddress } from '../model/user';

interface RegisterUserRequest {
  nickname: string;
  profileImage: string;
  addresses: Omit<UserAddress, 'id'>[];
}

/** `POST` - 회원 가입 API */
const postRegisterUser = async (request: RegisterUserRequest) => {
  return await api
    .post(`auth/register`, {
      json: request,
    })
    .json<ApiResponse<User>>();
};

/** `POST` - 회원 탈퇴 API */
const postWithdraw = async (userId: string) => {
  return await api.post(`auth/withdraw/${userId}`);
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

export {
  type RegisterUserRequest,
  type UserInfo,
  postRegisterUser,
  postWithdraw,
  getUserInfo,
  postUpdateUserNickname,
  postUpdateUserEmail,
};
