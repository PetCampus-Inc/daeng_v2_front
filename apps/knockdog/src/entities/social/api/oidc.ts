import { SocialProvider, SocialUser, VerifyOidcResultCode } from '../model';
import { ApiResponse } from '@shared/types/api';
import api from '@shared/api/ky-client';

export interface VerifyOidcTokenParams {
  idToken: string;
  provider: SocialProvider;
  name?: string;
  picture?: string;
}

export const postVerifyOidc = async (
  params: VerifyOidcTokenParams
): Promise<ApiResponse<SocialUser, VerifyOidcResultCode>> => {
  return await api.post('auth/verify/oidc', { json: params }).json<ApiResponse<SocialUser, VerifyOidcResultCode>>();
};
