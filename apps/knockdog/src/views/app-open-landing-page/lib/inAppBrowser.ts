type InAppBrowser = 'kakaotalk' | 'instagram';

function getInAppBrowser(userAgent: string): InAppBrowser | null {
  const ua = userAgent.toLowerCase();
  if (ua.includes('kakaotalk')) return 'kakaotalk';
  if (ua.includes('instagram')) return 'instagram';
  return null;
}

function toChromeIntentUrl(httpsUrl: string) {
  const url = new URL(httpsUrl);
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(httpsUrl)};end`;
}

/** 인앱 WebView를 벗어나면 true. iOS 인스타처럼 공식 탈출 API가 없으면 false. */
function openInExternalBrowser(kind: InAppBrowser, httpsUrl: string): boolean {
  if (kind === 'kakaotalk') {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(httpsUrl)}`;
    return true;
  }

  if (kind === 'instagram' && /android/i.test(window.navigator.userAgent)) {
    window.location.href = toChromeIntentUrl(httpsUrl);
    return true;
  }

  return false;
}

export { getInAppBrowser, openInExternalBrowser };
export type { InAppBrowser };
