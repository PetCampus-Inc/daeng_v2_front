import { User } from '../model';
import { ApiResponse } from '@shared/types/api';
import api from '@shared/api/ky-client';

/** `POST` - 로그인 API */
export const postLogin = async (): Promise<ApiResponse<User>> => {
  return await api.post('auth/login').json<ApiResponse<User>>();
};

/** `POST` - 로그아웃 API */
export const postLogout = async (): Promise<void> => {
  return await api.post('auth/logout').json();
};

/** `POST` - 회원 탈퇴 API */
export const postWithdraw = async (userId: string): Promise<void> => {
  return await api.post(`auth/withdraw/${userId}`).json();
};
