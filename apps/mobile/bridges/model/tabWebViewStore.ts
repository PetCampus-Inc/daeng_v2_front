import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { TabName } from '../lib/tabRoutes';

class TabWebViewStore {
  private tabRefs = new Map<TabName, RefObject<WebView | null>>();

  register(tabName: TabName, webRef: RefObject<WebView | null>) {
    this.tabRefs.set(tabName, webRef);
  }

  get(tabName: TabName): RefObject<WebView | null> | undefined {
    return this.tabRefs.get(tabName);
  }

  cleanup(tabName: TabName) {
    this.tabRefs.delete(tabName);
  }

  clear() {
    this.tabRefs.clear();
  }
}

export const tabWebViewStore = new TabWebViewStore();
