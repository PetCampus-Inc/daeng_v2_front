'use client';

import { useEffect } from 'react';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { detectPlatform, isNativeWebView } from '@shared/lib/device';

import {
  APP_OPEN_NATIVE_SCHEME,
  APP_OPEN_STORE_FALLBACK_MS,
  APP_OPEN_STORE_URLS,
  APP_OPEN_WEB_HOME_URL,
} from '../config/appOpenLandingContent';

interface UseAppOpenLandingOptions {
  /** 앱을 열 때 유지해야 하는 딥링크. 생략하면 보호자 홈으로 연다. */
  nativeUrl?: string;
}

function useAppOpenLanding({ nativeUrl = APP_OPEN_NATIVE_SCHEME }: UseAppOpenLandingOptions = {}) {
  const { reset } = useStackNavigation();

  useEffect(() => {
    if (isNativeWebView()) {
      // 설치·딥링크로 앱 WebView에 진입한 경우 → 보호자 홈 (비로그인은 홈/가드에서 처리)
      void reset(route.root);
      return;
    }

    const platform = detectPlatform();

    if (platform !== 'ios' && platform !== 'android') {
      window.location.replace(APP_OPEN_WEB_HOME_URL);
      return;
    }

    // 앱 오픈을 먼저 시도하고, 미설치로 판단되면 스토어로 이동
    window.location.href = nativeUrl;

    const timerId = window.setTimeout(() => {
      if (document.visibilityState === 'hidden') return;
      window.location.replace(APP_OPEN_STORE_URLS[platform]);
    }, APP_OPEN_STORE_FALLBACK_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [nativeUrl, reset]);
}

export { useAppOpenLanding };
