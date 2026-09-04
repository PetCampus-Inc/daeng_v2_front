import type { SocialLoginResult } from '@knockdog/bridge-core';

import {
  KAKAO_OAUTH_CALLBACK_PATH,
  KAKAO_OAUTH_MESSAGE_TYPE,
  type KakaoOAuthMessage,
} from './kakaoOAuthMessage';
import { SocialLoginCancelledError } from './socialLoginCancelledError';

/** authorize client_id = REST API 키 (모바일 Native 키와 다름, 같은 Kakao 앱이어야 sub 동일) */
const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ?? '';

const KAKAO_OAUTH_STATE_KEY = 'knockdog.kakao_oauth_state';
const KAKAO_TOKEN_API_PATH = '/api/auth/kakao/token';

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function buildKakaoAuthUrl(redirectUri: string, state: string): string {
  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.searchParams.set('client_id', KAKAO_REST_API_KEY);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  // OIDC: openid 필수. 닉네임/이메일/프로필은 동의항목 설정에 따름
  url.searchParams.set('scope', 'openid,account_email,profile_nickname,profile_image');
  url.searchParams.set('state', state);
  return url.toString();
}

function openCenteredPopup(url: string, name: string, width = 480, height = 700): Window | null {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;
  const screenWidth = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const screenHeight = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;
  const left = Math.max(0, dualScreenLeft + (screenWidth - width) / 2);
  const top = Math.max(0, dualScreenTop + (screenHeight - height) / 2);

  const popup = window.open(
    'about:blank',
    name,
    `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`
  );

  if (popup) popup.location.href = url;
  return popup;
}

function isKakaoOAuthMessage(data: unknown): data is KakaoOAuthMessage {
  if (!data || typeof data !== 'object') return false;
  const message = data as Partial<KakaoOAuthMessage>;
  return message.type === KAKAO_OAUTH_MESSAGE_TYPE && (message.status === 'success' || message.status === 'error');
}

async function exchangeKakaoCode(code: string, redirectUri: string): Promise<SocialLoginResult> {
  const response = await fetch(KAKAO_TOKEN_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  });

  const payload = (await response.json()) as SocialLoginResult & { error?: string };

  if (!response.ok || !payload.idToken) {
    throw new Error(payload.error || 'Kakao token exchange failed');
  }

  return {
    idToken: payload.idToken,
    email: payload.email ?? '',
    name: payload.name ?? '',
    picture: payload.picture ?? '',
  };
}

/**
 * Kakao OAuth popup → code → Next API 로 id_token 교환 → SocialLoginResult.
 *
 * Kakao Console (모바일과 동일 앱):
 * - OpenID Connect ON
 * - Redirect URI: `{origin}/auth/kakao/callback`
 * - Platform Web 도메인 등록
 * - env: NEXT_PUBLIC_KAKAO_REST_API_KEY, (선택) KAKAO_CLIENT_SECRET
 */
async function kakaoWebLogin(): Promise<SocialLoginResult> {
  if (!KAKAO_REST_API_KEY) {
    throw new Error('NEXT_PUBLIC_KAKAO_REST_API_KEY is not set');
  }

  const redirectUri = `${window.location.origin}${KAKAO_OAUTH_CALLBACK_PATH}`;
  const state = createNonce();
  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);

  const popup = openCenteredPopup(buildKakaoAuthUrl(redirectUri, state), 'knockdog-kakao-login');
  if (!popup) {
    sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);
    throw new Error('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.');
  }

  const code = await new Promise<string>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      window.clearInterval(closedPoll);
      sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);
    };

    const settle = (value: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        popup.close();
      } catch {
        // ignore
      }
      resolve(value);
    };

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        popup.close();
      } catch {
        // ignore
      }
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isKakaoOAuthMessage(event.data)) return;

      const expectedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY);
      if (event.data.state && expectedState && event.data.state !== expectedState) {
        fail(new Error('Kakao OAuth state mismatch'));
        return;
      }

      if (event.data.status === 'error') {
        if (
          event.data.error === 'access_denied' ||
          event.data.error === 'popup_closed' ||
          event.data.error === 'user_cancel'
        ) {
          fail(new SocialLoginCancelledError());
          return;
        }
        fail(new Error(event.data.error || 'Kakao OAuth failed'));
        return;
      }

      settle(event.data.code);
    };

    window.addEventListener('message', handleMessage);

    const closedPoll = window.setInterval(() => {
      if (!popup.closed || settled) return;
      window.clearInterval(closedPoll);
      window.setTimeout(() => {
        if (!settled) fail(new SocialLoginCancelledError());
      }, 500);
    }, 400);
  });

  return exchangeKakaoCode(code, redirectUri);
}

export { kakaoWebLogin, KAKAO_REST_API_KEY };
