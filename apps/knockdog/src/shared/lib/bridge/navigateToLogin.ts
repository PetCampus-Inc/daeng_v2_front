import { METHODS } from '@knockdog/bridge-core';
import { getBridgeInstance } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { route } from '@shared/constants/route';

/**
 * hook 없이 /login 페이지로 stack navigation
 * @description interceptor 등 hook을 사용할 수 없는 환경에서 사용
 */
async function navigateToLogin() {
  const pathname = route.auth.login.root;
  const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  if (isNativeWebView()) {
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
    if (!webUrl) {
      console.error('[navigateToLogin] NEXT_PUBLIC_WEB_URL is not defined');
      window.location.href = pathname;
      return;
    }
    const fullPath = `${webUrl}/${normalizedPath}`;
    // 네이티브 환경: bridge를 통해 stack push
    const bridge = getBridgeInstance();

    if (!bridge) {
      console.warn('[navigateToLogin] Bridge not initialized, falling back to window.location');
      window.location.href = pathname;
      return;
    }

    try {
      await bridge.request(METHODS.navPush, {
        name: fullPath,
        params: {},
      });
    } catch (error) {
      console.error('[navigateToLogin] Failed to navigate via bridge:', error);
      // Fallback: window.location 사용
      window.location.href = pathname;
    }
    return;
  }

  // 웹 환경: window.location 사용
  window.location.href = pathname;
}

export { navigateToLogin };
