import { METHODS } from '@knockdog/bridge-core';
import { getBridgeInstance } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { route } from '@shared/constants/route';

// 중복 호출 방지를 위한 플래그
let isNavigating = false;

/**
 * hook 없이 로그인 화면으로 navigation (reset)
 * push가 아니라 reset이라 뒤로가기로 비로그인 탭에 떨어지지 않음
 * interceptor 등 hook을 사용할 수 없는 환경에서 사용
 */
async function navigateToLogin() {
  if (isNavigating) {
    return;
  }

  isNavigating = true;

  try {
    const pathname = route.auth.login.root;
    const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

    if (isNativeWebView()) {
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
      if (!webUrl) {
        console.error('[navigateToLogin] NEXT_PUBLIC_WEB_URL is not defined');
        window.location.replace(pathname);
        return;
      }
      const baseUrl = webUrl.replace(/\/+$/, '');
      const fullPath = `${baseUrl}/${normalizedPath}`;
      const bridge = getBridgeInstance();

      if (!bridge) {
        console.warn('[navigateToLogin] Bridge not initialized, falling back to window.location');
        window.location.replace(pathname);
        return;
      }

      try {
        await bridge.request(METHODS.navReset, {
          name: fullPath,
          params: {},
        });
      } catch (error) {
        console.error('[navigateToLogin] Failed to navigate via bridge:', error);
        window.location.replace(pathname);
      }
      return;
    }

    window.location.replace(pathname);
  } finally {
    setTimeout(() => {
      isNavigating = false;
    }, 1000);
  }
}

export { navigateToLogin };
