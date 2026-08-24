'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { detectPlatform, isNativeWebView } from '@shared/lib/device';

import {
  APP_OPEN_NATIVE_DEEP_LINK,
  APP_OPEN_STORE_FALLBACK_MS,
  APP_OPEN_STORE_URLS,
} from '../config/appOpenLandingContent';
import { getInAppBrowser, openInExternalBrowser } from '../lib/inAppBrowser';
import { useAppOpenLanding } from '../model/useAppOpenLanding';

const subscribe = () => () => undefined;

function AppOpenLandingPage() {
  const isPlatformResolved = useSyncExternalStore(subscribe, () => true, () => false);
  const isNative = useSyncExternalStore(subscribe, isNativeWebView, () => false);
  const inAppBrowser = useSyncExternalStore(
    subscribe,
    () => getInAppBrowser(window.navigator.userAgent),
    () => null
  );

  useEffect(() => {
    if (!isPlatformResolved || isNative || !inAppBrowser) return;

    const currentUrl = window.location.href;
    if (openInExternalBrowser(inAppBrowser, currentUrl)) {
      const platform = detectPlatform();
      if (platform !== 'ios' && platform !== 'android') return;

      const timerId = window.setTimeout(() => {
        if (document.visibilityState === 'hidden') return;
        window.location.replace(APP_OPEN_STORE_URLS[platform]);
      }, APP_OPEN_STORE_FALLBACK_MS);

      return () => window.clearTimeout(timerId);
    }

    const platform = detectPlatform();
    if (platform === 'ios' || platform === 'android') {
      window.location.replace(APP_OPEN_STORE_URLS[platform]);
    }
  }, [inAppBrowser, isNative, isPlatformResolved]);

  useAppOpenLanding({
    nativeUrl: APP_OPEN_NATIVE_DEEP_LINK,
    enabled: isPlatformResolved && (isNative || !inAppBrowser),
  });

  return <div className='bg-bg-0 h-dvh' />;
}

export { AppOpenLandingPage };
