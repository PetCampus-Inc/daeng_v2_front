import { CommonActions, StackActions } from '@react-navigation/native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { isNavReady, navigationRef } from '../lib/navigationRef';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { navBridgeHub } from '../model/navBridgeHub';
import { tabWebViewStore } from '../model/tabWebViewStore';

type WebNavPayload = {
  name: string; // 예: '/detail'
  params?: Record<string, unknown> | { query?: Record<string, unknown> };
};

type ParamsWithQuery = {
  query?: Record<string, unknown>;
};

type ParamsWithoutQuery = Record<string, unknown>;

// params에서 query를 추출해서 쿼리스트링으로 변환
// name은 전체 URL 또는 경로일 수 있음
function buildPath(name: string, params?: WebNavPayload['params']) {
  const query =
    params && 'query' in params ? (params as ParamsWithQuery).query : (params as ParamsWithoutQuery | undefined);

  const searchParams = new URLSearchParams();
  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value == null) continue;
      searchParams.set(key, String(value));
    }
  }
  const queryString = searchParams.toString();
  if (!queryString) return name;

  // 전체 URL인지 경로인지 확인
  const separator = name.includes('?') ? '&' : '?';
  return `${name}${separator}${queryString}`;
}

// params에서 initialState(_txId, _params) 추출
function extractInitialState(params?: WebNavPayload['params']) {
  if (!params) return undefined;

  // params가 { query, _txId, _params } 형태인 경우
  if ('_txId' in params || '_params' in params) {
    const result = {
      _txId: params._txId as string | undefined,
      _params: params._params,
      query: 'query' in params ? params.query : undefined,
    };
    return result;
  }

  return undefined;
}

/** URL에서 경로만 추출 */
function extractPathFromUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '/';
  }

  // "undefined/..." 같은 잘못된 URL 패턴 체크
  if (url.startsWith('undefined/') || url.startsWith('undefined?')) {
    console.error('[extractPathFromUrl] Invalid URL pattern detected:', url);
    // "undefined/" 제거하고 경로만 반환
    const cleaned = url.replace(/^undefined/, '');
    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // URL 파싱 실패 시 원본 반환 (이미 경로일 수 있음)
    // 하지만 "undefined/..." 같은 패턴은 이미 위에서 처리됨
    return url.startsWith('/') ? url : `/${url}`;
  }
}

/** 웹 경로 → 네이티브 라우트 변환 (Tabs / Stack(path)) */
function toRoute(
  payload?: WebNavPayload
): { screen: 'Tabs'; params: undefined } | { screen: 'Stack'; params: { path: string; initialState?: any } } {
  const name = payload?.name ?? '/';
  const params = payload?.params;

  // 전체 URL인지 경로인지 확인
  let isFullUrl = false;
  let pathname = name;

  try {
    const urlObj = new URL(name);
    isFullUrl = true;
    pathname = urlObj.pathname;
  } catch {
    // URL 파싱 실패 시 경로로 간주
    pathname = extractPathFromUrl(name);
  }

  // Tabs로 이동할 경로인지 확인 (경로 기준)
  const normalizedPath = pathname === '/' || pathname === '' ? '/' : pathname;
  // 탭 경로: /, /save, /compare, /mypage
  if (
    normalizedPath === '/' ||
    normalizedPath === '/home' ||
    normalizedPath === '/save' ||
    normalizedPath === '/compare' ||
    normalizedPath === '/mypage'
  ) {
    return { screen: 'Tabs', params: undefined };
  }

  const initialState = extractInitialState(params);

  // 전체 URL이면 전체 URL에 쿼리 추가, 경로면 경로에 쿼리 추가
  const finalPath = isFullUrl ? buildPath(name, params) : buildPath(normalizedPath, params);

  const route = {
    screen: 'Stack' as const,
    params: {
      path: finalPath,
      ...(initialState && { initialState }),
    },
  };

  return route;
}

function registerNavigationHandlers(router: NativeBridgeRouter, options?: { currentWebRef: RefObject<WebView> }) {
  const registerIfTx = (
    route: { screen: 'Tabs'; params: undefined } | { screen: 'Stack'; params: { path: string; initialState?: any } }
  ) => {
    if (route.screen === 'Stack') {
      const txId = route.params?.initialState?._txId as string | undefined;

      if (txId) {
        if (!options?.currentWebRef) {
          if (__DEV__) {
            console.warn('[registerIfTx] currentWebRef not provided for txId:', txId);
          }
          return;
        }
        navBridgeHub.register(txId, options.currentWebRef);
      }
    }
  };

  // Push
  router.register<WebNavPayload>(METHODS.navPush, async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };

    const route = toRoute(payload);

    registerIfTx(route);

    if (route.screen === 'Tabs') {
      navigationRef.navigate('Tabs');
    } else {
      navigationRef.dispatch(StackActions.push('Stack', route.params));
    }

    return { pushed: true };
  });

  // Back
  router.register(METHODS.navBack, async () => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };

    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
      return { wentBack: true };
    }

    return { wentBack: false };
  });

  // Replaced
  router.register<WebNavPayload>(METHODS.navReplace, async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };
    const route = toRoute(payload);

    registerIfTx(route);

    if (route.screen === 'Tabs') {
      navigationRef.dispatch(StackActions.replace('Tabs'));
    } else {
      navigationRef.dispatch(StackActions.replace('Stack', route.params));
    }

    return { replaced: true };
  });

  // RESET
  router.register<WebNavPayload | undefined>(METHODS.navReset, async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };
    const route = toRoute(payload);

    registerIfTx(route);

    if (route.screen === 'Tabs') {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs' }],
        })
      );
    } else {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Stack', params: route.params }],
        })
      );
    }

    return { reset: true };
  });

  // Switch Tab
  router.register<{ pathname: string; query?: Record<string, unknown> }>('system.navSwitchTab', async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };

    // 경로에서 탭 이름 추출
    const pathname = payload.pathname;
    let tabName: 'Explore' | 'Save' | 'Compare' | 'Mypage' = 'Explore';
    if (pathname === '/save') tabName = 'Save';
    else if (pathname === '/compare') tabName = 'Compare';
    else if (pathname === '/mypage') tabName = 'Mypage';

    // 탭 네비게이션으로 이동: navigate를 사용하면 애니메이션 없이 즉시 전환됨
    navigationRef.navigate('Tabs', { screen: tabName });

    // query가 있으면 탭 전환 후 해당 탭의 WebView에 URL 변경 스크립트 주입
    if (payload.query && Object.keys(payload.query).length > 0) {
      // 탭 전환이 완료될 시간을 주기 위해 약간의 딜레이
      setTimeout(() => {
        const tabWebRef = tabWebViewStore.get(tabName);
        if (tabWebRef?.current) {
          // query를 쿼리스트링으로 변환
          const searchParams = new URLSearchParams();
          for (const [key, value] of Object.entries(payload.query!)) {
            if (value == null) continue;
            if (Array.isArray(value)) {
              for (const item of value) {
                searchParams.append(key, String(item));
              }
            } else {
              searchParams.set(key, String(value));
            }
          }
          const queryString = searchParams.toString();

          // WebView에 JavaScript 주입하여 URL 변경
          const queryStringEscaped = JSON.stringify(queryString);
          const script = `
            (function() {
              try {
                var url = new URL(window.location.href);
                var queryStr = ${queryStringEscaped};
                var newHref = url.pathname + (queryStr ? ('?' + queryStr) : '') + url.hash;
                history.pushState(null, '', newHref);
                // URL 변경 이벤트 발생시키기 (Next.js router가 감지하도록)
                window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
              } catch (e) {
                console.error('[navSwitchTab] URL 변경 실패:', e);
              }
            })();
          `;

          tabWebRef.current.injectJavaScript(script);
        }
      }, 100);
    }

    return { switched: true };
  });
}

export { registerNavigationHandlers };
