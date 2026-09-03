import type { SocialLoginResult } from '@knockdog/bridge-core';

import { decodeJwtPayload } from './decodeJwtPayload';
import {
  GOOGLE_OAUTH_CALLBACK_PATH,
  GOOGLE_OAUTH_MESSAGE_TYPE,
  type GoogleOAuthMessage,
} from './googleOAuthMessage';
import { SocialLoginCancelledError } from './socialLoginCancelledError';

/** BE `oauth.google.client-id.web` 과 동일 — aud 검증용 web 클라이언트 */
const GOOGLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  '589885832776-lma7fngffn9aa1lgiclk4k8n6rjdrt6g.apps.googleusercontent.com';

const GOOGLE_OAUTH_STATE_KEY = 'knockdog.google_oauth_state';
const GOOGLE_OAUTH_NONCE_KEY = 'knockdog.google_oauth_nonce';

interface GoogleJwtPayload {
  email?: string;
  name?: string;
  picture?: string;
  nonce?: string;
  aud?: string | string[];
}

function toSocialLoginResult(credential: string): SocialLoginResult {
  const payload = decodeJwtPayload<GoogleJwtPayload>(credential);
  const email = payload.email ?? '';

  return {
    idToken: credential,
    email,
    name: (payload.name?.trim() || email.split('@')[0]) ?? '',
    picture: payload.picture ?? '',
  };
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function buildGoogleAuthUrl(redirectUri: string, state: string, nonce: string): string {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', GOOGLE_WEB_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'id_token');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

function openCenteredPopup(url: string, name: string, width = 500, height = 650): Window | null {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;
  const screenWidth = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const screenHeight = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;
  const left = Math.max(0, dualScreenLeft + (screenWidth - width) / 2);
  const top = Math.max(0, dualScreenTop + (screenHeight - height) / 2);

  // 사용자 제스처 안에서 즉시 open — about:blank 후 이동하면 팝업 차단 회피에 유리
  const popup = window.open(
    'about:blank',
    name,
    `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`
  );

  if (popup) popup.location.href = url;
  return popup;
}

function isGoogleOAuthMessage(data: unknown): data is GoogleOAuthMessage {
  if (!data || typeof data !== 'object') return false;
  const message = data as Partial<GoogleOAuthMessage>;
  return message.type === GOOGLE_OAUTH_MESSAGE_TYPE && (message.status === 'success' || message.status === 'error');
}

/**
 * OAuth popup + id_token (prompt=select_account).
 * 네이티브처럼 로그인 버튼 클릭 즉시 계정 선택창이 뜬다.
 *
 * Google Cloud Console:
 * - Authorized JavaScript origins: 현재 origin
 * - Authorized redirect URIs: `{origin}/auth/google/callback`
 */
async function googleWebLogin(): Promise<SocialLoginResult> {
  const redirectUri = `${window.location.origin}${GOOGLE_OAUTH_CALLBACK_PATH}`;
  const state = createNonce();
  const nonce = createNonce();

  sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
  sessionStorage.setItem(GOOGLE_OAUTH_NONCE_KEY, nonce);

  const popup = openCenteredPopup(buildGoogleAuthUrl(redirectUri, state, nonce), 'knockdog-google-login');
  if (!popup) {
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GOOGLE_OAUTH_NONCE_KEY);
    throw new Error('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.');
  }

  return new Promise<SocialLoginResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      window.clearInterval(closedPoll);
      sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      sessionStorage.removeItem(GOOGLE_OAUTH_NONCE_KEY);
    };

    const settle = (result: SocialLoginResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        popup.close();
      } catch {
        // ignore
      }
      resolve(result);
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
      if (!isGoogleOAuthMessage(event.data)) return;

      const expectedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
      if (event.data.state && expectedState && event.data.state !== expectedState) {
        fail(new Error('Google OAuth state mismatch'));
        return;
      }

      if (event.data.status === 'error') {
        if (event.data.error === 'access_denied' || event.data.error === 'popup_closed') {
          fail(new SocialLoginCancelledError());
          return;
        }
        fail(new Error(event.data.error || 'Google OAuth failed'));
        return;
      }

      try {
        const expectedNonce = sessionStorage.getItem(GOOGLE_OAUTH_NONCE_KEY);
        const payload = decodeJwtPayload<GoogleJwtPayload>(event.data.idToken);
        if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
          fail(new Error('Google OAuth nonce mismatch'));
          return;
        }
        settle(toSocialLoginResult(event.data.idToken));
      } catch (error) {
        fail(error);
      }
    };

    window.addEventListener('message', handleMessage);

    // callback 이 postMessage 후 close 하면, close 감지보다 message 핸들러가 늦을 수 있음
    const closedPoll = window.setInterval(() => {
      if (!popup.closed || settled) return;
      window.clearInterval(closedPoll);
      window.setTimeout(() => {
        if (!settled) fail(new SocialLoginCancelledError());
      }, 500);
    }, 400);
  });
}

export { googleWebLogin, GOOGLE_WEB_CLIENT_ID };
