import { VerifyOidcResponse, VerifyOidcTokenParams } from '../model';

import api from '@shared/api/ky-client';

export const postVerifyOidc = async (params: VerifyOidcTokenParams) => {
  return await api
    .post('auth/verify/oidc', {
      json: params,
    })
    .json<VerifyOidcResponse>();
};
