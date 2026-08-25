import { CommonActions, StackActions } from '@react-navigation/native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { isNavReady, navigationRef } from '../lib/navigationRef';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { navBridgeHub } from '../model/navBridgeHub';
import { tabWebViewStore } from '../model/tabWebViewStore';
import { useMainTabModeStore, type MainTabMode } from '../model/mainTabModeStore';
import { useBottomTabBarVisibilityStore } from '../model/bottomTabBarVisibilityStore';
import { pathToTab, pathToBaseTab, isGuardianOnlyTab, isOwnerOnlyTab, type TabName } from '../lib/tabRoutes';

type WebNavPayload = {
  name: string; // 예: '/detail'
  params?: Record<string, unknown> | { query?: Record<string, unknown> };
};

type ParamsWithQuery = {
  query?: Record<string, unknown>;
};

type ParamsWithoutQuery = Record<string, unknown>;

type TabsRoute = {
  screen: 'Tabs';
  params: { screen: TabName } | undefined;
};

type StackRoute = {
  screen: 'Stack';
  params: { path: string; initialState?: any };
};

type NativeRoute = TabsRoute | StackRoute;

/** WebView 요청은 비동기로 도착할 수 있으므로, 가장 최근 탭바 상태 요청만 적용한다. */
let lastBottomTabBarVisibilityRequestId = 0;
let lastBottomTabBarDimRequestId = 0;

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

function resolveTabScreen(tabName: TabName): TabName {
  // 원장 모드 승격은 SyncNativeMainTabModeEffect(권한 확인 후 navSetMainTabMode)만 담당.
  // 탭 이름만으로 setMode('owner') 하면 비원장도 원장 탭바로 전환됨.
  const mode = useMainTabModeStore.getState().mode;

  if (mode === 'owner' && isGuardianOnlyTab(tabName)) return 'OwnerHome';
  if (mode === 'guardian' && isOwnerOnlyTab(tabName)) return 'Explore';
  return tabName;
}

function getActiveTabName(): TabName | null {
  const state = navigationRef.getState();
  if (!state) return null;

  const tabsRoute = state.routes.find((route) => route.name === 'Tabs');
  const tabState = tabsRoute?.state;
  if (!tabState) return null;

  const activeRoute = tabState.routes[tabState.index ?? 0];
  return (activeRoute?.name as TabName | undefined) ?? null;
}

/** 네이티브 탭바 높이가 바뀐 뒤 WebView의 바텀시트·지도 레이아웃을 다시 계산한다. */
function notifyActiveTabViewportChanged() {
  // React Navigation의 탭바 레이아웃 반영 뒤에 WebView에 resize를 전달한다.
  setTimeout(() => {
    const activeTab = getActiveTabName();
    if (!activeTab) return;

    tabWebViewStore.get(activeTab)?.current?.injectJavaScript("window.dispatchEvent(new Event('resize'));true;");
  }, 100);
}

function isStackFocused(): boolean {
  const state = navigationRef.getState();
  if (!state) return false;
  return state.routes[state.index ?? 0]?.name === 'Stack';
}

let lastMainTabModeRequest: { id: number; source: RefObject<WebView> | null } = {
  id: 0,
  source: null,
};

function isRequestFromActiveTab(currentWebRef?: RefObject<WebView>) {
  if (isStackFocused()) return false;

  const activeTab = getActiveTabName();
  if (!activeTab || !currentWebRef?.current) return false;

  return tabWebViewStore.get(activeTab)?.current === currentWebRef.current;
}

/** 모드 전환 직후 TabNavigator 재렌더링과 겹쳐도 기본 탭 화면 전환을 보장한다. */
function navigateToModeDefaultTab(mode: MainTabMode) {
  const targetTab = mode === 'owner' ? 'OwnerHome' : 'Explore';
  const navigate = () => navigationRef.navigate('Tabs', { screen: targetTab });

  navigate();

  // 앱 시작 직후에는 Tabs의 nested state가 아직 생성되지 않을 수 있다.
  // 다음 프레임에 한 번 더 확인해 바텀탭 모드와 화면이 어긋나지 않게 한다.
  setTimeout(() => {
    if (isStackFocused()) return;

    const activeTab = getActiveTabName();
    const isStillOppositeMode =
      !activeTab ||
      (mode === 'owner' && isGuardianOnlyTab(activeTab)) ||
      (mode === 'guardian' && isOwnerOnlyTab(activeTab));

    if (!isStillOppositeMode) return;
    navigate();
  }, 0);
}

function applyMainTabModeNow(mode: MainTabMode) {
  // Stack 화면에서는 탭 이동 없이 모드만 선반영한다.
  // 원장 인증 완료 후 reset이 올바른 원장 탭을 선택할 수 있어야 한다.
  if (isStackFocused()) {
    useMainTabModeStore.getState().setMode(mode);
    return;
  }

  const current = useMainTabModeStore.getState().mode;
  if (current !== mode) {
    useMainTabModeStore.getState().setMode(mode);
  }

  if (!isNavReady()) return;

  const activeTab = getActiveTabName();
  if (activeTab === 'Mypage') return;

  if (!activeTab || (mode === 'owner' && isGuardianOnlyTab(activeTab))) {
    navigateToModeDefaultTab(mode);
    return;
  }

  if (mode === 'guardian' && isOwnerOnlyTab(activeTab)) {
    navigateToModeDefaultTab(mode);
  }
}

/** 현재 활성 탭에서 온 최신 모드 요청만 즉시 반영한다. */
function applyMainTabMode(mode: MainTabMode) {
  applyMainTabModeNow(mode);
}

/** 웹 경로 → 네이티브 라우트 변환 (Tabs / Stack(path)) */
function toRoute(payload?: WebNavPayload): NativeRoute {
  const name = payload?.name ?? '/';
  const params = payload?.params;

  // 전체 URL인지 경로인지 확인
  let isFullUrl = false;
  let isExternalUrl = false;
  let pathname = name;

  try {
    const urlObj = new URL(name);
    isFullUrl = true;
    // 외부 URL인지 확인 (EXPO_PUBLIC_WEBVIEW_URL과 다른 도메인)
    const webUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL || '';
    isExternalUrl = urlObj.origin !== new URL(webUrl || 'http://localhost').origin;
    pathname = urlObj.pathname;
  } catch {
    // URL 파싱 실패 시 경로로 간주
    pathname = extractPathFromUrl(name);
  }

  // 외부 URL이면 무조건 Stack으로 처리
  if (isExternalUrl) {
    const initialState = extractInitialState(params);
    const finalPath = buildPath(name, params);

    return {
      screen: 'Stack' as const,
      params: {
        path: finalPath,
        ...(initialState && { initialState }),
      },
    };
  }

  // Tabs로 이동할 경로인지 확인 (경로 기준)
  const normalizedPath = pathname === '/' || pathname === '' ? '/' : pathname;
  const tabName = pathToTab(normalizedPath);
  if (tabName) {
    return {
      screen: 'Tabs' as const,
      params: { screen: tabName },
    };
  }

  const initialState = extractInitialState(params);

  // 전체 URL이면 전체 URL에 쿼리 추가, 경로면 경로에 쿼리 추가
  const finalPath = isFullUrl ? buildPath(name, params) : buildPath(normalizedPath, params);

  return {
    screen: 'Stack' as const,
    params: {
      path: finalPath,
      ...(initialState && { initialState }),
    },
  };
}

function registerNavigationHandlers(router: NativeBridgeRouter, options?: { currentWebRef: RefObject<WebView> }) {
  const registerIfTx = (route: NativeRoute) => {
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
      const tabName = resolveTabScreen(route.params?.screen ?? 'Explore');
      navigationRef.navigate('Tabs', { screen: tabName });
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
      const tabName = resolveTabScreen(route.params?.screen ?? 'Explore');
      navigationRef.dispatch(StackActions.replace('Tabs', { screen: tabName }));
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
      const tabName = resolveTabScreen(route.params?.screen ?? 'Explore');
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', params: { screen: tabName } }],
        })
      );
    } else {
      // Stack 아래 Tabs는 경로의 부모 탭으로 깔아 뒤로가기가 올바른 탭으로 가게 함
      // (예: /owner/daily/notice/... → OwnerDaily)
      let stackPathname = '/';
      try {
        stackPathname = new URL(route.params.path, 'https://placeholder.local').pathname;
      } catch {
        stackPathname = extractPathFromUrl(route.params.path);
      }
      const baseTab = resolveTabScreen(pathToBaseTab(stackPathname) ?? getActiveTabName() ?? 'Explore');

      navigationRef.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Tabs', params: { screen: baseTab } },
            { name: 'Stack', params: route.params },
          ],
        })
      );
    }

    return { reset: true };
  });

  /**
   * 탭 전환이 완료되고 WebView가 준비될 때까지 대기
   * @param targetTabName 목표 탭 이름
   * @param maxWaitTime 최대 대기 시간 (ms)
   * @param checkInterval 체크 간격 (ms)
   * @returns WebView ref 또는 null
   */
  async function waitForTabReady(
    targetTabName: TabName,
    maxWaitTime = 2000,
    checkInterval = 50
  ): Promise<RefObject<WebView | null> | null> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkTabReady = () => {
        const elapsed = Date.now() - startTime;

        // 최대 대기 시간 초과
        if (elapsed >= maxWaitTime) {
          if (__DEV__) {
            console.warn(`[waitForTabReady] 타임아웃: ${targetTabName} 탭이 ${maxWaitTime}ms 내에 준비되지 않음`);
          }
          resolve(null);
          return;
        }

        // Navigation state 확인: 현재 활성화된 탭이 목표 탭인지 확인
        const state = navigationRef.getState();
        const isTabActive =
          state &&
          state.routes[state.index]?.name === 'Tabs' &&
          state.routes[state.index]?.state?.routes?.[state.routes[state.index].state?.index ?? 0]?.name ===
            targetTabName;

        // WebView ref 확인
        const tabWebRef = tabWebViewStore.get(targetTabName);
        const isWebViewReady = tabWebRef?.current !== null && tabWebRef?.current !== undefined;

        // 탭이 활성화되고 WebView가 준비되었으면 완료
        if (isTabActive && isWebViewReady) {
          resolve(tabWebRef);
          return;
        }

        // 아직 준비되지 않았으면 다음 체크까지 대기
        setTimeout(checkTabReady, checkInterval);
      };

      checkTabReady();
    });
  }

  // Switch Tab
  router.register<{ pathname: string; query?: Record<string, unknown> }>(METHODS.navSwitchTab, async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };

    const tabName = resolveTabScreen(pathToTab(payload.pathname) ?? 'Explore');

    // 탭 네비게이션으로 이동: navigate를 사용하면 애니메이션 없이 즉시 전환됨
    navigationRef.navigate('Tabs', { screen: tabName });

    // query가 있으면 탭 전환 후 해당 탭의 WebView에 URL 변경 스크립트 주입
    if (payload.query && Object.keys(payload.query).length > 0) {
      // 탭 전환이 완료되고 WebView가 준비될 때까지 대기
      const tabWebRef = await waitForTabReady(tabName);

      if (tabWebRef?.current) {
        // query를 쿼리스트링으로 변환
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(payload.query)) {
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
      } else if (__DEV__) {
        console.warn(`[navSwitchTab] ${tabName} 탭의 WebView를 찾을 수 없어 URL 변경 스크립트를 주입하지 못했습니다.`);
      }
    }

    return { switched: true };
  });

  router.register<{ mode: MainTabMode; requestId: number; force?: boolean }>(
    METHODS.navSetMainTabMode,
    async (payload) => {
      const mode = payload?.mode === 'owner' ? 'owner' : 'guardian';
      const requestId = payload?.requestId ?? 0;

      if (!payload?.force && !isRequestFromActiveTab(options?.currentWebRef)) {
        return { mode: useMainTabModeStore.getState().mode };
      }

      // 요청 순번은 WebView별로 생성된다. 다른 탭이 새로 활성화된 경우에는
      // 이전 탭의 더 큰 순번이 최신 활성 탭 요청을 막지 않도록 출처별로 비교한다.
      if (
        !payload?.force &&
        options?.currentWebRef === lastMainTabModeRequest.source &&
        requestId < lastMainTabModeRequest.id
      ) {
        return { mode: useMainTabModeStore.getState().mode };
      }

      lastMainTabModeRequest = {
        id: requestId,
        source: payload?.force ? null : (options?.currentWebRef ?? null),
      };
      applyMainTabMode(mode);
      return { mode };
    }
  );

  router.register<{ visible: boolean; requestId: number }>(METHODS.navSetBottomTabBarVisible, async (payload) => {
    if (payload.requestId < lastBottomTabBarVisibilityRequestId) {
      return { visible: useBottomTabBarVisibilityStore.getState().visible };
    }

    lastBottomTabBarVisibilityRequestId = payload.requestId;
    const visible = payload?.visible !== false;
    useBottomTabBarVisibilityStore.getState().setVisible(visible);
    notifyActiveTabViewportChanged();
    return { visible };
  });

  router.register<{ dimmed: boolean; requestId: number }>(METHODS.navSetBottomTabBarDimmed, async (payload) => {
    if (payload.requestId < lastBottomTabBarDimRequestId) {
      return { dimmed: useBottomTabBarVisibilityStore.getState().dimmed };
    }

    lastBottomTabBarDimRequestId = payload.requestId;
    const dimmed = payload?.dimmed === true;
    useBottomTabBarVisibilityStore.getState().setDimmed(dimmed);
    return { dimmed };
  });
}

export { registerNavigationHandlers };
