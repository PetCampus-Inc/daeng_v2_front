import { beforeEach, describe, expect, it, vi } from 'vitest';
import { METHODS } from '@knockdog/bridge-core';
import { registerNavigationHandlers } from './register-navigation';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  dispatch: vi.fn(),
  inject: vi.fn(),
  save: vi.fn(),
  webview: { current: { injectJavaScript: vi.fn() } },
}));
vi.mock('@react-navigation/native', () => ({
  StackActions: { push: (name: string, params: unknown) => ({ type: 'PUSH', name, params }) },
  CommonActions: {},
}));
vi.mock('@knockdog/bridge-native', () => ({}));
vi.mock('../lib/navigationRef', () => ({
  isNavReady: () => true,
  navigationRef: { navigate: mocks.navigate, dispatch: mocks.dispatch },
}));
vi.mock('../model/navBridgeHub', () => ({ navBridgeHub: { register: vi.fn() } }));
vi.mock('../model/tabWebViewStore', () => ({ tabWebViewStore: { get: () => mocks.webview } }));
vi.mock('../model/mainTabModeStore', () => ({
  useMainTabModeStore: { getState: () => ({ mode: 'owner' }) },
}));
vi.mock('../model/bottomTabBarVisibilityStore', () => ({ useBottomTabBarVisibilityStore: {} }));
vi.mock('../lib/tabQueryInject', () => ({
  injectTabQueryIntoWebView: mocks.inject,
  pendingTabQueryStore: { set: mocks.save },
}));
vi.mock('../lib/isFirstPartyWebViewUrl', () => ({ getFirstPartyWebOrigin: () => 'https://example.test' }));

describe('navPush 탭 쿼리 전달', () => {
  const handlers = new Map<string, (payload: unknown) => Promise<unknown>>();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('EXPO_PUBLIC_WEBVIEW_URL', 'https://example.test');
    handlers.clear();
    registerNavigationHandlers({
      register: (method: string, handler: (payload: unknown) => Promise<unknown>) => handlers.set(method, handler),
    } as unknown as Parameters<typeof registerNavigationHandlers>[0]);
  });

  it.each([
    { tab: 'pending', homeEntry: '1' },
    { tab: 'registered', filter: 'expiring', homeEntry: '2' },
  ])('구성원 탭에 쿼리를 보존하고 WebView에 주입한다: %j', async (query) => {
    await handlers.get(METHODS.navPush)!({ name: 'https://example.test/owner/members', params: { query } });
    expect(mocks.navigate).toHaveBeenCalledWith('Tabs', { screen: 'OwnerMembers' });
    expect(mocks.save).toHaveBeenCalledWith('OwnerMembers', query);
    expect(mocks.save.mock.invocationCallOrder[0]).toBeLessThan(mocks.navigate.mock.invocationCallOrder[0]);
    expect(mocks.inject).toHaveBeenCalledWith(mocks.webview.current, query);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it('쿼리 없는 탭 이동은 기존처럼 이동만 한다', async () => {
    await handlers.get(METHODS.navPush)!({ name: 'https://example.test/owner/members' });
    expect(mocks.navigate).toHaveBeenCalledWith('Tabs', { screen: 'OwnerMembers' });
    expect(mocks.inject).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('일반 화면은 쿼리를 포함해 기존처럼 스택에 쌓는다', async () => {
    await handlers.get(METHODS.navPush)!({
      name: 'https://example.test/owner/news',
      params: { query: { source: 'home' } },
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'PUSH',
      name: 'Stack',
      params: { path: 'https://example.test/owner/news?source=home' },
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.inject).not.toHaveBeenCalled();
  });
});
