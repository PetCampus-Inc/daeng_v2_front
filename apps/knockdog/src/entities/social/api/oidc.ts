import { SocialProvider, SocialUser, VerifyOidcResultCode } from '../model';
import api from '@shared/api/ky-client';

export interface VerifyOidcTokenParams {
  idToken: string;
  provider: SocialProvider;
  name?: string;
  picture?: string;
}

export interface VerifyOidcResponse extends SocialUser {
  oidcAuthToken: string;
  code: VerifyOidcResultCode;
}

export const postVerifyOidc = async (params: VerifyOidcTokenParams): Promise<VerifyOidcResponse> => {
  return await api
    .post('auth/verify/oidc', {
      json: params,
    })
    .json<VerifyOidcResponse>();
};
