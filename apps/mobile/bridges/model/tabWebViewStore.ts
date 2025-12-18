import type { RefObject } from 'react';
import type WebView from 'react-native-webview';

class TabWebViewStore {
  private tabRefs = new Map<'Explore' | 'Save' | 'Compare' | 'Mypage', RefObject<WebView | null>>();

  register(tabName: 'Explore' | 'Save' | 'Compare' | 'Mypage', webRef: RefObject<WebView | null>) {
    this.tabRefs.set(tabName, webRef);
  }

  get(tabName: 'Explore' | 'Save' | 'Compare' | 'Mypage'): RefObject<WebView | null> | undefined {
    return this.tabRefs.get(tabName);
  }

  cleanup(tabName: 'Explore' | 'Save' | 'Compare' | 'Mypage') {
    this.tabRefs.delete(tabName);
  }

  clear() {
    this.tabRefs.clear();
  }
}

export const tabWebViewStore = new TabWebViewStore();
