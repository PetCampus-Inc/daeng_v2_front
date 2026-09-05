import type { SocialLoginResult } from '@knockdog/bridge-core';

import { SOCIAL_PROVIDER, type SocialProvider } from '@entities/social-user';

import { appleWebLogin } from './appleWebLogin';
import { googleWebLogin } from './googleWebLogin';
import { kakaoWebLogin } from './kakaoWebLogin';

/** provider별 웹 로그인 팝업/콜백 중복 방지 (네이티브 브릿지 경로와 무관) */
const webSocialLoginInFlight = new Map<SocialProvider, Promise<SocialLoginResult>>();

/**
 * 데스크톱/모바일 브라우저용 소셜 로그인.
 * 네이티브 WebView 브릿지와 동일한 SocialLoginResult 를 반환해야 한다.
 */
async function webSocialLogin(provider: SocialProvider): Promise<SocialLoginResult> {
  const existing = webSocialLoginInFlight.get(provider);
  if (existing) return existing;

  const promise = (async (): Promise<SocialLoginResult> => {
    switch (provider) {
      case SOCIAL_PROVIDER.GOOGLE:
        return googleWebLogin();
      case SOCIAL_PROVIDER.APPLE:
        return appleWebLogin();
      case SOCIAL_PROVIDER.KAKAO:
        return kakaoWebLogin();
      default: {
        const _exhaustive: never = provider;
        throw new Error(`Unsupported social provider: ${_exhaustive}`);
      }
    }
  })().finally(() => {
    webSocialLoginInFlight.delete(provider);
  });

  webSocialLoginInFlight.set(provider, promise);
  return promise;
}

export { webSocialLogin };
