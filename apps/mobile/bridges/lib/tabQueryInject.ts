import type WebView from 'react-native-webview';
import { pathToTab, type TabName } from './tabRoutes';

/** knockdog STORAGE_KEYS.OWNER_DAILY_TAB — Tab/Stack WebView sessionStorage 미공유, localStorage 사용 */
const OWNER_DAILY_TAB_STORAGE_KEY = 'OWNER_DAILY_TAB';

function buildOwnerDailyTabStorageScript(query: Record<string, unknown>) {
  const tab = query.tab;
  if (tab !== 'today-attendance' && tab !== 'attendance-check') return '';

  const tabEscaped = JSON.stringify(String(tab));
  const keyEscaped = JSON.stringify(OWNER_DAILY_TAB_STORAGE_KEY);
  return `
        try {
          localStorage.setItem(${keyEscaped}, ${tabEscaped});
          sessionStorage.setItem(${keyEscaped}, ${tabEscaped});
        } catch (e) {
          console.error('[tabQueryInject] storage 동기화 실패:', e);
        }
  `;
}

function buildTabQueryScript(query: Record<string, unknown>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  const queryStringEscaped = JSON.stringify(searchParams.toString());
  const ownerDailyTabStorageScript = buildOwnerDailyTabStorageScript(query);
  const tabValue = query.tab;
  const ownerDailyTabSyncScript =
    tabValue === 'today-attendance' || tabValue === 'attendance-check'
      ? `
        window.dispatchEvent(
          new CustomEvent('knockdog:owner-daily-tab-sync', { detail: { tab: ${JSON.stringify(String(tabValue))} } })
        );
      `
      : '';

  return `
    (function() {
      try {
        var url = new URL(window.location.href);
        var queryStr = ${queryStringEscaped};
        var newHref = url.pathname + (queryStr ? ('?' + queryStr) : '') + url.hash;
        history.replaceState(null, '', newHref);
        ${ownerDailyTabStorageScript}
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        ${ownerDailyTabSyncScript}
      } catch (e) {
        console.error('[tabQueryInject] URL 변경 실패:', e);
      }
    })();
    true;
  `;
}

class PendingTabQueryStore {
  private pending = new Map<TabName, Record<string, unknown>>();

  set(tabName: TabName, query: Record<string, unknown>) {
    this.pending.set(tabName, query);
  }

  consume(tabName: TabName): Record<string, unknown> | null {
    const query = this.pending.get(tabName);
    if (!query) return null;
    this.pending.delete(tabName);
    return query;
  }
}

export const pendingTabQueryStore = new PendingTabQueryStore();

export function resolveTabNameFromUri(uri: string): TabName | null {
  try {
    return pathToTab(new URL(uri).pathname);
  } catch {
    const pathname = uri.split('?')[0] ?? uri;
    return pathToTab(pathname.startsWith('/') ? pathname : `/${pathname}`);
  }
}

export function injectTabQueryIntoWebView(webview: WebView, query: Record<string, unknown>) {
  if (Object.keys(query).length === 0) return;
  webview.injectJavaScript(buildTabQueryScript(query));
}

export function applyPendingTabQuery(webview: WebView | null, tabName: TabName) {
  if (!webview) return false;

  const query = pendingTabQueryStore.consume(tabName);
  if (!query || Object.keys(query).length === 0) return false;

  injectTabQueryIntoWebView(webview, query);
  return true;
}
