import { SocialProvider, SocialUser } from '../model/socialUser';

import { ApiResponse, api } from '@shared/api';

const VERIFY_OIDC_RESULT_CODE = {
  /** 정상 처리 되었을 때 */
  SUCCESS: 'SUCCESS',
  /** 연동되지 않은 계정 */
  UNLINKED: 'UNLINKED',
  /** 이미 존재하는 이메일 주소 */
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
} as const;

type VerifyOidcResultCode = (typeof VERIFY_OIDC_RESULT_CODE)[keyof typeof VERIFY_OIDC_RESULT_CODE];

interface VerifyOidcTokenParams {
  idToken: string;
  provider: SocialProvider;
  name?: string;
  picture?: string;
}

const postVerifyOidc = async (
  params: VerifyOidcTokenParams
): Promise<ApiResponse<SocialUser, VerifyOidcResultCode>> => {
  return await api.post('auth/verify/oidc', { json: params }).json<ApiResponse<SocialUser, VerifyOidcResultCode>>();
};

export { postVerifyOidc, VERIFY_OIDC_RESULT_CODE };
