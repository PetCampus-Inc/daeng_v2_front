import { StackActions } from '@react-navigation/native';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { serializeForJS } from '@knockdog/bridge-native';
import { BRIDGE_VERSION } from '@knockdog/bridge-core';
import { navigationRef } from '@/bridges/lib/navigationRef';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';
import { API_URL } from '@/constants/apiUrl';
import { resolvePushDestination, type PushDestination } from './pushPayload';

function toStackWebUrl(path: string) {
  const base = (API_URL ?? '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

type WebRef = RefObject<WebView>;

class PushCoordinator {
  private currentToken: string | null = null;
  private platform: 'IOS' | 'ANDROID' = 'IOS';
  private readyWebViews = new Set<WebRef>();
  private activeWebView: WebRef | null = null;
  private navigationReady = false;
  private pendingDestination: PushDestination | null = null;
  private lastDestinationKey: string | null = null;
  private lastDestinationAt = 0;

  setToken(token: string, platform: 'IOS' | 'ANDROID') {
    if (!token) return;
    this.currentToken = token;
    this.platform = platform;
    this.sendToken(this.activeWebView);
  }

  markSessionReady(webRef: WebRef) {
    this.readyWebViews.add(webRef);
    this.activeWebView = webRef;
    this.sendToken(webRef);
    this.flushNavigation();
  }

  removeSessionWebView(webRef: WebRef) {
    this.readyWebViews.delete(webRef);
    if (this.activeWebView !== webRef) return;

    this.activeWebView = [...this.readyWebViews].at(-1) ?? null;
  }

  markNavigationReady() {
    this.navigationReady = true;
    this.flushNavigation();
  }

  enqueueNavigation(payload: unknown) {
    const destination = resolvePushDestination(payload);
    const destinationKey = this.toDestinationKey(destination);
    const now = Date.now();

    // FCM 탭 이벤트와 foreground 로컬 알림 탭 이벤트가 같은 payload로 연속 도착할 수 있다.
    if (destinationKey === this.lastDestinationKey && now - this.lastDestinationAt < 1_000) return;

    this.lastDestinationKey = destinationKey;
    this.lastDestinationAt = now;
    this.pendingDestination = destination;
    this.flushNavigation();
  }

  private sendToken(webRef: WebRef | null) {
    const nativeWebView = webRef?.current;
    if (!this.currentToken || !nativeWebView) return;
    const message = {
      id: `evt-${Date.now()}`,
      type: 'event' as const,
      event: 'push.fcmToken',
      payload: { token: this.currentToken, platform: this.platform },
      meta: { v: BRIDGE_VERSION, source: 'native' as const, ts: Date.now() },
    };

    try {
      nativeWebView.injectJavaScript(`window.__bridge?.receive(${serializeForJS(message)}); true;`);
    } catch (error) {
      if (__DEV__) console.warn('[PushCoordinator] token delivery failed', error);
    }
  }

  private flushNavigation() {
    if (!this.pendingDestination || !this.navigationReady || !this.activeWebView?.current || !navigationRef.isReady()) return;

    const destination = this.pendingDestination;
    this.pendingDestination = null;

    if (destination.kind === 'attendanceRecord') {
      const params = new URLSearchParams({
        petId: destination.petId,
        date: destination.date,
      });
      navigationRef.dispatch(StackActions.push('Stack', { path: toStackWebUrl(`/compare/notice?${params}`) }));
      return;
    }

    if (destination.kind === 'guardianKindergarten') {
      navigationRef.navigate('Tabs', { screen: 'Compare' });
      this.setCompareTabPet(destination.petId, destination.date);
      return;
    }

    if (destination.kind === 'ownerMemberApprovals') {
      navigationRef.navigate('Tabs', { screen: 'OwnerMembers' });
      navigationRef.dispatch(StackActions.push('Stack', { path: toStackWebUrl('/owner/members/approval') }));
      return;
    }

    navigationRef.navigate('Tabs', { screen: 'Explore' });
  }

  private setCompareTabPet(petId: string, _date?: string, attempt = 0) {
    const compareWebView = tabWebViewStore.get('Compare')?.current;
    if (!compareWebView) {
      if (attempt < 20) setTimeout(() => this.setCompareTabPet(petId, _date, attempt + 1), 50);
      return;
    }

    const serializedPetId = serializeForJS(petId);
    compareWebView.injectJavaScript(`
      (function() {
        var petId = ${serializedPetId};
        try {
          localStorage.setItem('GUARDIAN_SELECTED_PET', JSON.stringify({ state: { selectedPetId: String(petId) }, version: 0 }));
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('knockdog:guardian-selected-pet', { detail: { petId: String(petId) } }));
        var url = new URL(window.location.href);
        url.searchParams.set('pushPetId', petId);
        url.searchParams.delete('pushDate');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      })(); true;
    `);
  }

  private toDestinationKey(destination: PushDestination) {
    if (destination.kind !== 'fallback') return destination.dedupeKey;
    return 'fallback';
  }
}

export const pushCoordinator = new PushCoordinator();
