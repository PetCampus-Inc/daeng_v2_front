import { CommonActions, StackActions } from '@react-navigation/native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { isNavReady, navigationRef } from '../lib/navigationRef';

type WebNavPayload = {
  name: string; // 예: '/detail'
  params?: Record<string, unknown> | { query?: Record<string, unknown> };
};

type ParamsWithQuery = {
  query?: Record<string, unknown>;
};

type ParamsWithoutQuery = Record<string, unknown>;

// params에서 query를 추출해서 쿼리스트링으로 변환
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
  return queryString ? `${name}${name.includes('?') ? '&' : '?'}${queryString}` : name;
}

/** 웹 경로 → 네이티브 라우트 변환 (Tabs / Stack(path)) */
function toRoute(
  payload?: WebNavPayload
): { screen: 'Tabs'; params: undefined } | { screen: 'Stack'; params: { path: string } } {
  const name = payload?.name ?? '/';
  const params = payload?.params;

  if (name === '/' || name === '/home') {
    return { screen: 'Tabs', params: undefined };
  }
  return { screen: 'Stack', params: { path: buildPath(name, params) } };
}

function registerNavigationHandlers(router: NativeBridgeRouter) {
  // Push
  router.register<WebNavPayload>(METHODS.navPush, async (payload) => {
    if (!isNavReady()) throw { code: 'EUNAVAILABLE', message: 'Navigation not ready' };
    const route = toRoute(payload);

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
}

export { registerNavigationHandlers };
