import { SocialUser } from '../model/socialUser';
import { User } from '@entities/user';
import { api, ApiResponse } from '@shared/api';

/** `POST` - 소셜 계정 재연동 API */
const postReconnectSocial = async () => {
  return await api.post(`user/social/reconnect`).json<ApiResponse<User>>();
};

/** `GET` - 연동된 소셜 계정 조회 API */
const fetchLinkedSocialUser = async () => {
  return await api.get(`user/social/user`).json<ApiResponse<SocialUser>>();
};

export { postReconnectSocial, fetchLinkedSocialUser };
