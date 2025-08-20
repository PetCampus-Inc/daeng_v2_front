import { SocialProvider, SocialUser } from './social-user';

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

export const VERIFY_OIDC_RESULT_CODE = {
  /** 정상 처리 되었을 때 */
  SUCCESS: 'SUCCESS',
  /** 연동되지 않은 계정 */
  UNLINKED: 'UNLINKED',
  /** 이미 존재하는 이메일 주소 */
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  /** 이미 연동된 계정 */
  ALREADY_LINKED: 'ALREADY_LINKED',
} as const;

export type VerifyOidcResultCode = (typeof VERIFY_OIDC_RESULT_CODE)[keyof typeof VERIFY_OIDC_RESULT_CODE];
