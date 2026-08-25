import type { WebViewMessageEvent } from 'react-native-webview';

import { isExternalWebViewUrl } from './isFirstPartyWebViewUrl';
import { navigationRef, isNavReady } from './navigationRef';

const NATIVE_BACK_UNHANDLED_TYPE = 'knockdog:native-back-unhandled';

function extractPathname(path: unknown): string {
  if (typeof path !== 'string' || !path) return '/';
  try {
    return new URL(path, 'https://placeholder.local').pathname;
  } catch {
    return path.split('?')[0] || '/';
  }
}

/** 로그인·권한 안내 등 — Tabs 없이 Stack만 둔 게이트 화면 */
function isAuthOnlyStackPath(pathname: string) {
  return (
    pathname === '/auth/login' ||
    pathname.startsWith('/auth/login/') ||
    pathname === '/auth/device-permission' ||
    pathname.startsWith('/auth/device-permission/') ||
    pathname.startsWith('/auth/rejoin-blocked') ||
    pathname.startsWith('/auth/reconnect-social')
  );
}

/**
 * Stack 화면에서 안드로이드 뒤로가기를 웹이 소비하지 않으면 네이티브 goBack.
 * 외부 origin 메시지는 무시.
 * 루트 Stack(canGoBack=false)이면 Tabs로 복귀하되, auth-only 게이트는 Tabs로 떨어지지 않음.
 */
function handleNativeBackUnhandledMessage(event: WebViewMessageEvent): boolean {
  try {
    const data = JSON.parse(event.nativeEvent.data) as { type?: string } | null;
    if (!data || data.type !== NATIVE_BACK_UNHANDLED_TYPE) return false;

    // 외부 페이지가 브릿지/back 메시지를 흉내 내지 못하도록
    if (isExternalWebViewUrl(event.nativeEvent.url)) return true;

    if (!isNavReady()) return true;

    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
      return true;
    }

    const state = navigationRef.getRootState?.() ?? navigationRef.getState?.();
    const current = state?.routes?.[state.index ?? 0];
    if (current?.name === 'Stack') {
      const pathname = extractPathname(
        (current.params as { path?: string } | undefined)?.path
      );
      // auth-only: 로그인 성공 전·후 모두 비로그인 탭으로 빠져나가지 않음 (시스템 back = 앱 종료)
      if (isAuthOnlyStackPath(pathname)) {
        return true;
      }
    }

    // Tabs→Stack replace 등으로 스택 루트에 갇히지 않도록
    navigationRef.navigate('Tabs');
    return true;
  } catch {
    return false;
  }
}

export { handleNativeBackUnhandledMessage, NATIVE_BACK_UNHANDLED_TYPE };
