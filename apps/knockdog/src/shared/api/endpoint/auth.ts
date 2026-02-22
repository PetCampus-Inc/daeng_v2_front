import { ApiResponse, api } from '@shared/api';

/** `POST` - 로그인 API */
export const postLogin = async <T>(): Promise<ApiResponse<T>> => {
  return await api.post('auth/login').json<ApiResponse<T>>();
};

/** `POST` - 로그아웃 API */
export const postLogout = async () => {
  return await api.post('auth/logout');
};

/** `POST` - 엑세스 토큰 재발급 API */
export const postTokenReissue = async () => {
  return await api.post('auth/refresh');
};

/** `GET` - DEV 로그인 API */
export const fetchDevLogin = async <T>(): Promise<ApiResponse<T>> => {
  const DEV_LOGIN_ID = 0;
  return await api.get(`auth/dev/${DEV_LOGIN_ID}`).json<ApiResponse<T>>();
};
