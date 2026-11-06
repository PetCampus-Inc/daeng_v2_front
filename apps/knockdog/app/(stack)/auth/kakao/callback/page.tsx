'use client';

import { useEffect } from 'react';

import { KAKAO_OAUTH_MESSAGE_TYPE, type KakaoOAuthMessage } from '@features/auth/lib/kakaoOAuthMessage';

/**
 * Kakao OAuth popup redirect 수신.
 * ?code= / ?error= 를 opener 로 postMessage 한 뒤 창을 닫는다.
 */
export default function KakaoOAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state') ?? undefined;
    const error = params.get('error') ?? params.get('error_description');

    const message: KakaoOAuthMessage = error
      ? { type: KAKAO_OAUTH_MESSAGE_TYPE, status: 'error', error, state }
      : code
        ? { type: KAKAO_OAUTH_MESSAGE_TYPE, status: 'success', code, state: state ?? '' }
        : { type: KAKAO_OAUTH_MESSAGE_TYPE, status: 'error', error: 'missing_code', state };

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
      window.close();
      return;
    }

    window.location.replace('/auth/login');
  }, []);

  return (
    <main className='flex min-h-dvh items-center justify-center bg-white text-sm text-neutral-500'>
      Kakao 로그인 처리 중…
    </main>
  );
}
