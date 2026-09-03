import type { SocialLoginResult } from '@knockdog/bridge-core';

import { decodeJwtPayload } from './decodeJwtPayload';
import { loadExternalScript } from './loadExternalScript';
import { SocialLoginCancelledError } from './socialLoginCancelledError';

/**
 * Apple Services ID (Bundle ID 아님).
 * 모바일과 동일 Team 아래 생성해야 sub 가 네이티브와 일치한다.
 * 예: net.knockdog.web
 */
const APPLE_SERVICES_ID = process.env.NEXT_PUBLIC_APPLE_SERVICES_ID ?? 'net.knockdog.web';

const APPLE_AUTH_SCRIPT_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

const APPLE_OAUTH_CALLBACK_PATH = '/auth/apple/callback';

interface AppleJwtPayload {
  email?: string;
  nonce?: string;
}

interface AppleName {
  firstName?: string;
  lastName?: string;
}

interface AppleSignInUser {
  email?: string;
  name?: AppleName;
}

interface AppleAuthorization {
  id_token: string;
  code?: string;
  state?: string;
}

interface AppleSignInResponse {
  authorization: AppleAuthorization;
  user?: AppleSignInUser;
}

interface AppleSignInError {
  error: string;
}

interface AppleIDAuth {
  init: (config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    nonce?: string;
    usePopup?: boolean;
  }) => void;
  signIn: (config?: { state?: string; nonce?: string; usePopup?: boolean }) => Promise<AppleSignInResponse>;
}

declare global {
  interface Window {
    AppleID?: {
      auth: AppleIDAuth;
    };
  }
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function resolveName(user: AppleSignInUser | undefined, email: string): string {
  const composed = [user?.name?.firstName, user?.name?.lastName].filter(Boolean).join(' ').trim();
  if (composed) return composed;
  return email.split('@')[0] ?? '';
}

function toSocialLoginResult(response: AppleSignInResponse): SocialLoginResult {
  const idToken = response.authorization?.id_token;
  if (!idToken) throw new Error('Apple id_token is empty');

  const payload = decodeJwtPayload<AppleJwtPayload>(idToken);
  const email = response.user?.email ?? payload.email ?? '';

  return {
    idToken,
    email,
    name: resolveName(response.user, email),
    picture: '',
  };
}

function waitForAppleID(timeoutMs = 10_000): Promise<AppleIDAuth> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const tick = () => {
      if (window.AppleID?.auth) {
        resolve(window.AppleID.auth);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('AppleID SDK failed to initialize'));
        return;
      }

      window.setTimeout(tick, 50);
    };

    tick();
  });
}

function isAppleCancelError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'error' in error ? String((error as AppleSignInError).error) : '';
  return (
    code === 'popup_closed_by_user' ||
    code === 'user_cancelled_authorize' ||
    code === 'user_cancel' ||
    code.toLowerCase().includes('cancel')
  );
}

/**
 * Sign in with Apple JS (usePopup).
 * authorization.id_token 을 바로 받아 브릿지 SocialLoginResult 로 변환. BE 교환 불필요.
 *
 * Apple Developer (모바일과 동일 Team):
 * - Services ID 생성 (NEXT_PUBLIC_APPLE_SERVICES_ID)
 * - Domains: app.knockdog.net
 * - Return URLs: https://app.knockdog.net/auth/apple/callback
 * - /.well-known/apple-developer-domain-association.txt 배포
 */
async function appleWebLogin(): Promise<SocialLoginResult> {
  await loadExternalScript(APPLE_AUTH_SCRIPT_SRC);
  const appleAuth = await waitForAppleID();

  const redirectURI = `${window.location.origin}${APPLE_OAUTH_CALLBACK_PATH}`;
  const state = createNonce();
  const nonce = createNonce();

  appleAuth.init({
    clientId: APPLE_SERVICES_ID,
    scope: 'name email',
    redirectURI,
    state,
    nonce,
    usePopup: true,
  });

  try {
    const response = await appleAuth.signIn({ state, nonce, usePopup: true });

    if (response.authorization?.state && response.authorization.state !== state) {
      throw new Error('Apple OAuth state mismatch');
    }

    const payload = decodeJwtPayload<AppleJwtPayload>(response.authorization.id_token);
    if (payload.nonce) {
      const hashedNonce = await sha256Hex(nonce);
      if (payload.nonce !== hashedNonce && payload.nonce !== nonce) {
        throw new Error('Apple OAuth nonce mismatch');
      }
    }

    return toSocialLoginResult(response);
  } catch (error) {
    if (isAppleCancelError(error)) throw new SocialLoginCancelledError();
    if (error instanceof SocialLoginCancelledError) throw error;
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export { appleWebLogin, APPLE_SERVICES_ID, APPLE_OAUTH_CALLBACK_PATH };
