import { SocialUser } from '../model/socialUser';
import { api, ApiResponse } from '@shared/api';

/** `POST` - 소셜 계정 재연동 API */
const postReconnectSocial = async () => {
  return await api.post(`auth/social/reconnect`).json<ApiResponse<SocialUser>>();
};

/** `GET` - 연동된 소셜 계정 조회 API */
const fetchLinkedSocialUser = async () => {
  return await api.get(`auth/social/user`).json<ApiResponse<SocialUser>>();
};

export { postReconnectSocial, fetchLinkedSocialUser };
