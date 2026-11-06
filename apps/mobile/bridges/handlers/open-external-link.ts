import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { METHODS } from '@knockdog/bridge-core';

/**
 * 인앱 브라우저(SFSafariViewController / Chrome Custom Tabs)로 URL 오픈.
 * - createTask: false → AOS 시스템 뒤로가기 시 Custom Tabs만 닫히고 원래 화면 복귀
 * - 닫으면 앱으로 복귀 — WebView 스크롤 위치 유지
 * - 실패 시에만 시스템 브라우저(Linking)로 폴백
 */
function handleOpenExternalLink(event: string, payload: unknown): boolean {
  if (event !== METHODS.openExternalLink) return false;

  const { url } = (payload ?? {}) as { url?: string };

  if (!url || typeof url !== 'string') {
    if (__DEV__) {
      console.warn('[Bridge] invalid openExternalLink payload', payload);
    }
    return true;
  }

  void WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: '#FF6E0C',
    dismissButtonStyle: 'close',
    // 기본 true면 별도 task라 뒤로가기 복귀가 불안정함
    createTask: false,
    showInRecents: false,
  }).catch((error) => {
    console.error('[Bridge] openBrowserAsync failed, fallback to Linking', error);
    Linking.openURL(url).catch((linkError) => {
      console.error('[Bridge] openExternalLink error', linkError);
    });
  });

  return true;
}

export { handleOpenExternalLink };
