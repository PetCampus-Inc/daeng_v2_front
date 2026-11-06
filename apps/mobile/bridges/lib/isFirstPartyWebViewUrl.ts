/** 앱 WebView first-party origin (EXPO_PUBLIC_WEBVIEW_URL) */
function getFirstPartyWebOrigin(): string | null {
  const webUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL || process.env.NEXT_PUBLIC_WEB_URL || '';
  if (!webUrl) return null;
  try {
    return new URL(webUrl).origin;
  } catch {
    return null;
  }
}

/**
 * WebView 메시지/네비게이션 URL이 first-party인지.
 * url이 비어 있으면 판별 불가 → 호출부에서 fail-open/closed 결정.
 */
function isFirstPartyWebViewUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const allowed = getFirstPartyWebOrigin();
    if (!allowed) return false;
    return new URL(url).origin === allowed;
  } catch {
    return false;
  }
}

function isExternalWebViewUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return !isFirstPartyWebViewUrl(url);
}

export { getFirstPartyWebOrigin, isExternalWebViewUrl, isFirstPartyWebViewUrl };
