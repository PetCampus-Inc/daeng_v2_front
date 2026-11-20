// @vitest-environment jsdom
import { createElement, useEffect } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebViewScreen from './WebViewScreen';
import { pendingTabQueryStore } from '../bridges/lib/tabQueryInject';

const state = vi.hoisted(() => ({
  props: {} as { onLoadStart: () => void; onLoad: () => void; onLoadEnd: () => void },
  focus: undefined as undefined | (() => void | (() => void)),
}));
vi.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    state.focus = callback;
    useEffect(callback, [callback]);
  },
}));
vi.mock('react-native-webview', () => ({ default: () => null }));
vi.mock('@/bridges/ui/BridgeWebView', () => ({
  BridgeWebView: (props: typeof state.props) => {
    state.props = props;
    return null;
  },
}));

const query = { tab: 'registered', filter: 'expiring', homeEntry: '1' };
const injectJavaScript = vi.fn();
const webviewRef = { current: { injectJavaScript } };
const mount = () =>
  render(
    createElement(WebViewScreen, {
      uri: 'https://example.test/owner/members',
      webviewRef: webviewRef as unknown as NonNullable<Parameters<typeof WebViewScreen>[0]['webviewRef']>,
    })
  );
const queryScripts = () => injectJavaScript.mock.calls.filter(([script]) => script.includes('queryStr'));

afterEach(cleanup);
beforeEach(() => {
  pendingTabQueryStore.consume('OwnerMembers');
  injectJavaScript.mockClear();
});

describe('탭 WebView 로딩과 pending 쿼리 적용', () => {
  it('ref가 있어도 로딩 중 focus에서는 보존하고 성공한 loadEnd에서 적용한다', () => {
    pendingTabQueryStore.set('OwnerMembers', query);
    mount();
    act(() => state.props.onLoadStart());
    act(() => state.focus?.());
    expect(queryScripts()).toHaveLength(0);

    act(() => {
      state.props.onLoad();
      state.props.onLoadEnd();
    });
    expect(queryScripts()).toHaveLength(1);
    expect(queryScripts()[0][0]).toContain('filter=expiring');
    expect(pendingTabQueryStore.consume('OwnerMembers')).toBeNull();
  });

  it('이미 로딩된 탭으로 복귀하면 새 쿼리를 즉시 적용한다', () => {
    mount();
    act(() => {
      state.props.onLoad();
      state.props.onLoadEnd();
    });
    pendingTabQueryStore.set('OwnerMembers', query);
    act(() => state.focus?.());
    expect(queryScripts()).toHaveLength(1);
  });

  it('새 문서를 로딩 중이면 focus가 와도 기다리고 최신 쿼리를 적용한다', () => {
    mount();
    act(() => {
      state.props.onLoad();
      state.props.onLoadEnd();
      state.props.onLoadStart();
    });
    pendingTabQueryStore.set('OwnerMembers', query);
    act(() => state.focus?.());
    expect(queryScripts()).toHaveLength(0);
    pendingTabQueryStore.set('OwnerMembers', { tab: 'pending', homeEntry: '2' });
    act(() => {
      state.props.onLoad();
      state.props.onLoadEnd();
    });
    expect(queryScripts()).toHaveLength(1);
    expect(queryScripts()[0][0]).toContain('tab=pending');
  });

  it('로드 실패의 loadEnd에서는 소비하지 않고 재시도 성공 시 적용한다', () => {
    pendingTabQueryStore.set('OwnerMembers', query);
    mount();
    act(() => {
      state.props.onLoadStart();
      state.props.onLoadEnd();
    });
    expect(queryScripts()).toHaveLength(0);
    act(() => {
      state.props.onLoadStart();
      state.props.onLoad();
      state.props.onLoadEnd();
    });
    expect(queryScripts()).toHaveLength(1);
  });
});
