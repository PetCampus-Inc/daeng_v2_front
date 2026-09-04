const KAKAO_OAUTH_CALLBACK_PATH = '/auth/kakao/callback';
const KAKAO_OAUTH_MESSAGE_TYPE = 'knockdog:kakao-oauth' as const;

interface KakaoOAuthSuccessMessage {
  type: typeof KAKAO_OAUTH_MESSAGE_TYPE;
  status: 'success';
  code: string;
  state: string;
}

interface KakaoOAuthErrorMessage {
  type: typeof KAKAO_OAUTH_MESSAGE_TYPE;
  status: 'error';
  error: string;
  state?: string;
}

type KakaoOAuthMessage = KakaoOAuthSuccessMessage | KakaoOAuthErrorMessage;

export { KAKAO_OAUTH_CALLBACK_PATH, KAKAO_OAUTH_MESSAGE_TYPE };
export type { KakaoOAuthMessage, KakaoOAuthSuccessMessage, KakaoOAuthErrorMessage };
