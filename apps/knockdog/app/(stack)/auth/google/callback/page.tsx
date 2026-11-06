'use client';

import { useEffect } from 'react';

import { GOOGLE_OAUTH_MESSAGE_TYPE, type GoogleOAuthMessage } from '@features/auth/lib/googleOAuthMessage';

/**
 * Google OAuth popup redirect 수신.
 * hash 의 id_token 을 opener 로 postMessage 한 뒤 창을 닫는다.
 */
export default function GoogleOAuthCallbackPage() {
  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const search = window.location.search.startsWith('?') ? window.location.search.slice(1) : '';
    const params = new URLSearchParams(hash || search);

    const idToken = params.get('id_token');
    const state = params.get('state') ?? undefined;
    const error = params.get('error');

    const message: GoogleOAuthMessage = error
      ? { type: GOOGLE_OAUTH_MESSAGE_TYPE, status: 'error', error, state }
      : idToken
        ? { type: GOOGLE_OAUTH_MESSAGE_TYPE, status: 'success', idToken, state: state ?? '' }
        : { type: GOOGLE_OAUTH_MESSAGE_TYPE, status: 'error', error: 'missing_id_token', state };

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
      window.close();
      return;
    }

    window.location.replace('/auth/login');
  }, []);

  return (
    <main className='flex min-h-dvh items-center justify-center bg-white text-sm text-neutral-500'>
      Google 로그인 처리 중…
    </main>
  );
}
