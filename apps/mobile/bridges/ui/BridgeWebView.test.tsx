// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { captureException } from '@sentry/react-native';
import type { WebViewProps } from 'react-native-webview';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BridgeWebView } from './BridgeWebView';

const mocks = vi.hoisted(() => ({
  webView: vi.fn((_props: WebViewProps) => null),
}));

vi.mock('@sentry/react-native', () => ({ captureException: vi.fn() }));
vi.mock('react-native-webview', () => ({ default: mocks.webView }));
vi.mock('react-native', () => ({
  AppState: { addEventListener: () => ({ remove: vi.fn() }) },
  Platform: { OS: 'android' },
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
vi.mock('../lib/onMessage', () => ({ makeOnMessage: vi.fn() }));
vi.mock('../wiring/createBridge', () => ({ createBridgeForWebView: () => ({ notifyReady: vi.fn() }) }));
vi.mock('../model/navBridgeHub', () => ({ navBridgeHub: { cleanup: vi.fn() } }));
vi.mock('@/lib/pushCoordinator', () => ({ pushCoordinator: { removeSessionWebView: vi.fn() } }));
vi.mock('./ErrorScreen', () => ({ default: () => null }));

const initialUrl = 'https://app.knockdog.test/start';
const redirectedUrl = 'https://app.knockdog.test/redirected';

describe('WebView HTTP error reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('__DEV__', false);
  });

  afterEach(() => vi.unstubAllGlobals());

  function emitHttpStatus(statusCode: number) {
    const view = render(<BridgeWebView uri={initialUrl} />);
    try {
      const props = mocks.webView.mock.lastCall?.[0];
      expect(props?.onHttpError).toBeTypeOf('function');
      props?.onHttpError?.({
        nativeEvent: { url: redirectedUrl, statusCode },
      } as Parameters<NonNullable<WebViewProps['onHttpError']>>[0]);
    } finally {
      view.unmount();
    }
  }

  it('reports a 503 at the redirect destination once', () => {
    emitHttpStatus(503);

    expect(captureException).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
      tags: { source: 'webview-http' },
      extra: { url: redirectedUrl, statusCode: 503 },
    });
  });

  it('ignores a status below 400', () => {
    emitHttpStatus(302);

    expect(captureException).not.toHaveBeenCalled();
  });
});
