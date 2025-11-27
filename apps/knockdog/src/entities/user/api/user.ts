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

export { type RegisterUserRequest, postRegisterUser, postWithdraw };
