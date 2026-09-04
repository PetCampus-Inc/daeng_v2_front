import { NextRequest, NextResponse } from 'next/server';

import type { SocialLoginResult } from '@knockdog/bridge-core';

interface KakaoTokenRequestBody {
  code?: string;
  redirectUri?: string;
}

interface KakaoTokenResponse {
  token_type?: string;
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
  error?: string;
  ['error_description']?: string;
}

interface KakaoIdTokenPayload {
  email?: string;
  nickname?: string;
  picture?: string;
}

function decodeJwtPayload(token: string): KakaoIdTokenPayload {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid Kakao id_token');

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as KakaoIdTokenPayload;
}

/**
 * Kakao authorization code → id_token 교환.
 * kauth.kakao.com/oauth/token 은 CORS 미허용이라 브라우저 직접 호출 불가 → 서버 프록시.
 *
 * env:
 * - KAKAO_REST_API_KEY (또는 NEXT_PUBLIC_KAKAO_REST_API_KEY)
 * - KAKAO_CLIENT_SECRET (Client Secret 사용 시)
 */
export async function POST(request: NextRequest) {
  const restApiKey = process.env.KAKAO_REST_API_KEY ?? process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;

  if (!restApiKey) {
    return NextResponse.json({ error: 'KAKAO_REST_API_KEY is not set' }, { status: 500 });
  }

  let body: KakaoTokenRequestBody;
  try {
    body = (await request.json()) as KakaoTokenRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code, redirectUri } = body;
  if (!code || !redirectUri) {
    return NextResponse.json({ error: 'code and redirectUri are required' }, { status: 400 });
  }

  const form = new URLSearchParams();
  /* Kakao token API는 snake_case 파라미터 고정 */
  form.set('grant_type', 'authorization_code');
  form.set('client_id', restApiKey);
  form.set('redirect_uri', redirectUri);
  form.set('code', code);

  if (clientSecret) form.set('client_secret', clientSecret);

  const kakaoResponse = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: form.toString(),
    cache: 'no-store',
  });

  const tokenPayload = (await kakaoResponse.json()) as KakaoTokenResponse;
  const kakaoErrorDescription = tokenPayload['error_description'];

  if (!kakaoResponse.ok || !tokenPayload.id_token) {
    console.error('[Kakao token exchange failed]', {
      status: kakaoResponse.status,
      error: tokenPayload.error,
      description: kakaoErrorDescription,
    });
    return NextResponse.json(
      {
        error: kakaoErrorDescription || tokenPayload.error || 'Kakao token exchange failed',
      },
      { status: 400 }
    );
  }

  const claims = decodeJwtPayload(tokenPayload.id_token);
  const email = claims.email ?? '';
  const result: SocialLoginResult = {
    idToken: tokenPayload.id_token,
    email,
    name: (claims.nickname?.trim() || email.split('@')[0]) ?? '',
    picture: claims.picture ?? '',
  };

  return NextResponse.json(result);
}
