import type WebView from 'react-native-webview';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyPendingTabQuery, pendingTabQueryStore, queueDiaryTabReturn } from './tabQueryInject';

const webOrigin = 'https://app.knockdog.test';
const detailUrl = `${webOrigin}/kindergarten/diary?date=2026-11-19`;

describe('native back from a guardian diary detail', () => {
  afterEach(() => {
    pendingTabQueryStore.consume('Kindergarten');
    vi.unstubAllEnvs();
  });

  it.each(['GO_BACK', 'POP', 'POP_TO_TOP'])('passes the diary date to the tab after %s', (action) => {
    vi.stubEnv('EXPO_PUBLIC_WEBVIEW_URL', webOrigin);
    queueDiaryTabReturn(detailUrl, action);

    const injectJavaScript = vi.fn();
    const webView = { injectJavaScript } as unknown as WebView;

    expect(applyPendingTabQuery(webView, 'Kindergarten')).toBe(true);
    expect(injectJavaScript).toHaveBeenCalledWith(expect.stringContaining('diaryReturnDate=2026-11-19'));
    expect(applyPendingTabQuery(webView, 'Kindergarten')).toBe(false);
  });

  it('ignores external URLs, diary creation, missing dates, and non-back actions', () => {
    vi.stubEnv('EXPO_PUBLIC_WEBVIEW_URL', webOrigin);
    queueDiaryTabReturn(detailUrl.replace(webOrigin, 'https://external.test'), 'POP');
    queueDiaryTabReturn(`${webOrigin}/kindergarten/diary/write?date=2026-11-19`, 'POP');
    queueDiaryTabReturn(`${webOrigin}/kindergarten/diary`, 'POP');
    queueDiaryTabReturn(detailUrl, 'REPLACE');

    expect(pendingTabQueryStore.consume('Kindergarten')).toBeNull();
  });
});
