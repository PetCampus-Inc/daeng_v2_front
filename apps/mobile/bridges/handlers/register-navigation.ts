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
import {
  pathToTab,
  pathToBaseTab,
  isGuardianOnlyTab,
  isOwnerOnlyTab,
  resolveTabScreen as resolveTabScreenForMode,
  type TabName,
} from '../lib/tabRoutes';
import {
  injectTabQueryIntoWebView,
  pendingTabQueryStore,
} from '../lib/tabQueryInject';

/** TabNavigator screen 등록 순서 — Stack reset 시 활성 탭 state 명시 */
const TAB_SCREEN_ORDER: TabName[] = [
  'Explore',
  'Save',
  'Compare',
  'OwnerHome',
  'OwnerDaily',
  'OwnerAlbum',
  'OwnerMembers',
  'Mypage',
];

function buildTabsNestedState(activeTabName: TabName) {
  const index = TAB_SCREEN_ORDER.indexOf(activeTabName);
  return {
    index: index >= 0 ? index : 0,
    routes: TAB_SCREEN_ORDER.map((name) => ({ name })),
  };
}

/**
 * Stack reset 시 Tabs를 처음부터 다시 만들면 Tab WebView가 remount되고
 * 활성 탭이 Explore(목록 0번)로 떨어졌다가 owner 모드 sync로 OwnerHome에 고정되는 경우가 있다.
 * 가능하면 기존 Tabs route 이름을 유지하고 활성 인덱스만 맞춘다.
 * (전체 NavigationState를 spread하면 stale/key 때문에 ResetState 타입이 깨짐)
 */
function resolveTabsRouteForStackReset(activeTabName: TabName) {
  const rootState = navigationRef.getRootState?.() ?? navigationRef.getState?.();
  const existingTabs = rootState?.routes?.find((route) => route.name === 'Tabs');
  const existingRoutes = existingTabs?.state?.routes;

  const routes =
    existingRoutes?.length && existingRoutes.every((route) => typeof route.name === 'string')
      ? existingRoutes.map((route) => ({ name: route.name as TabName }))
      : TAB_SCREEN_ORDER.map((name) => ({ name }));

  const index = routes.findIndex((route) => route.name === activeTabName);

  return {
    name: 'Tabs' as const,
    params: { screen: activeTabName },
    state: {
      index: index >= 0 ? index : 0,
      routes,
    },
  };
}

/** 미로그인 게이트 화면 — Tabs 없이 Stack만 reset */
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
  return resolveTabScreenForMode(tabName, useMainTabModeStore.getState().mode);
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
      const query = extractQueryFromNavParams(payload?.params);
      if (query) {
        pendingTabQueryStore.set(tabName, query);
      }

      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Tabs',
              params: { screen: tabName },
              state: buildTabsNestedState(tabName),
            },
          ],
        })
      );

      if (query) {
        await injectTabWebViewQuery(tabName, query);
      }
    } else {
      // Stack 아래 Tabs는 경로의 부모 탭으로 깔아 뒤로가기가 올바른 탭으로 가게 함
      // (예: /owner/daily/notice/... → OwnerDaily)
      let stackPathname = '/';
      try {
        stackPathname = new URL(route.params.path, 'https://placeholder.local').pathname;
      } catch {
        stackPathname = extractPathFromUrl(route.params.path);
      }

      // 로그인·권한 안내 등 인증 게이트: Tabs를 깔지 않아 비로그인 탭으로 뒤로가기 불가
      if (isAuthOnlyStackPath(stackPathname)) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Stack', params: route.params }],
          })
        );
        return { reset: true };
      }

      const baseTab = resolveTabScreen(pathToBaseTab(stackPathname) ?? getActiveTabName() ?? 'Explore');

      navigationRef.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [resolveTabsRouteForStackReset(baseTab), { name: 'Stack', params: route.params }],
        })
      );
    }

    return { reset: true };
  });

  function extractQueryFromNavParams(params?: WebNavPayload['params']) {
    if (!params || typeof params !== 'object' || Array.isArray(params)) return null;

    if ('query' in params) {
      const query = params.query;
      if (!query || typeof query !== 'object' || Array.isArray(query)) return null;
      return query as Record<string, unknown>;
    }

    const query = Object.fromEntries(
      Object.entries(params).filter(([key]) => key !== '_txId' && key !== '_params')
    );

    return Object.keys(query).length > 0 ? query : null;
  }

  async function injectTabWebViewQuery(tabName: TabName, query: Record<string, unknown>) {
    if (Object.keys(query).length === 0) return;

    pendingTabQueryStore.set(tabName, query);

    // ref가 생겼다고 해서 페이지 JS가 이미 떠 있다는 보장은 없다. 여기서 바로 consume해버리면
    // 이 주입이 페이지 로드보다 빨라 씹혔을 때, WebViewScreen의 focus/onLoadEnd가 제공하는
    // 재시도 기회까지 같이 사라진다. consume은 그쪽에 맡기고 여기서는 최선 시도만 한다.
    const tabWebRef = await waitForTabReady(tabName, 5000);
    if (tabWebRef?.current) {
      injectTabQueryIntoWebView(tabWebRef.current, query);
    }
  }

  /**
   * 탭 전환이 완료되고 WebView가 준비될 때까지 대기
   * @param targetTabName 목표 탭 이름
   * @param maxWaitTime 최대 대기 시간 (ms)
   * @param checkInterval 체크 간격 (ms)
   * @returns WebView ref 또는 null
   */
  async function waitForTabReady(
    targetTabName: TabName,
    maxWaitTime = 5000,
    checkInterval = 50
  ): Promise<RefObject<WebView | null> | null> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkTabReady = () => {
        const elapsed = Date.now() - startTime;
        const tabWebRef = tabWebViewStore.get(targetTabName);
        const isWebViewReady = tabWebRef?.current != null;

        if (isWebViewReady) {
          resolve(tabWebRef ?? null);
          return;
        }

        if (elapsed >= maxWaitTime) {
          if (__DEV__) {
            console.warn(
              `[waitForTabReady] 타임아웃: ${targetTabName} Tab WebView ref 미준비 (${maxWaitTime}ms)`
            );
          }
          resolve(null);
          return;
        }

        setTimeout(checkTabReady, checkInterval);
      };

      checkTabReady();
    });
  }

  // Switch Tab
  router.register<{ pathname: string; query?: Record<string, unknown> }>(METHODS.navSwitchTab, async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };

    const tabName = resolveTabScreen(pathToTab(payload.pathname) ?? 'Explore');

    if (payload.query && Object.keys(payload.query).length > 0) {
      pendingTabQueryStore.set(tabName, payload.query);
    }

    navigationRef.navigate('Tabs', { screen: tabName });

    if (payload.query && Object.keys(payload.query).length > 0) {
      await injectTabWebViewQuery(tabName, payload.query);
    }

    return { switched: true };
  });

  router.register<{ mode: MainTabMode; requestId: number; force?: boolean }>(
    METHODS.navSetMainTabMode,
    async (payload) => {
      const mode = payload?.mode === 'owner' ? 'owner' : 'guardian';
      const requestId = payload?.requestId ?? 0;
      const activeTab = getActiveTabName();
      const activeTabWebView = activeTab ? tabWebViewStore.get(activeTab)?.current : null;
      const isRequestFromCurrentTab = isRequestFromActiveTab(options?.currentWebRef);
      // 앱 시작 직후에는 활성 WebView ref가 아직 store에 등록되지 않아 현재 탭 요청도
      // 판별할 수 없다. force는 이 짧은 구간에서만 허용하고, ref 등록 후에는 이전 탭이
      // 보낸 요청이 현재 모드를 덮어쓰지 못하게 한다.
      const canForceBeforeActiveRefRegistration = payload?.force === true && !activeTabWebView;

      if (!isRequestFromCurrentTab && !canForceBeforeActiveRefRegistration) {
        return { mode: useMainTabModeStore.getState().mode };
      }

      // 요청 순번은 WebView별로 생성된다. 다른 탭이 새로 활성화된 경우에는
      // 이전 탭의 더 큰 순번이 최신 활성 탭 요청을 막지 않도록 출처별로 비교한다.
      if (
        isRequestFromCurrentTab &&
        options?.currentWebRef === lastMainTabModeRequest.source &&
        requestId < lastMainTabModeRequest.id
      ) {
        return { mode: useMainTabModeStore.getState().mode };
      }

      lastMainTabModeRequest = {
        id: requestId,
        source: options?.currentWebRef ?? null,
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
