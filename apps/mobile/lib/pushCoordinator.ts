import { StackActions } from '@react-navigation/native';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { serializeForJS } from '@knockdog/bridge-native';
import { BRIDGE_VERSION } from '@knockdog/bridge-core';
import { navigationRef } from '@/bridges/lib/navigationRef';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';
import type { TabName } from '@/bridges/lib/tabRoutes';
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
  private notificationPermissionGrantedListeners = new Set<() => void>();

  onNotificationPermissionGranted(listener: () => void) {
    this.notificationPermissionGrantedListeners.add(listener);
    return () => this.notificationPermissionGrantedListeners.delete(listener);
  }

  notifyNotificationPermissionGranted() {
    this.notificationPermissionGrantedListeners.forEach((listener) => listener());
  }

  setToken(token: string, platform: 'IOS' | 'ANDROID') {
    if (!token) return;
    this.currentToken = token;
    this.platform = platform;
    if (__DEV__) {
      console.info('[PushDevice] native fcm token ready', {
        platform,
        hasActiveWebView: Boolean(this.activeWebView?.current),
      });
    }
    this.sendToken(this.activeWebView);
  }

  markSessionReady(webRef: WebRef) {
    this.readyWebViews.add(webRef);
    this.activeWebView = webRef;
    if (__DEV__) {
      console.info('[PushDevice] push.sessionReady received — delivering token to webview', {
        hasToken: Boolean(this.currentToken),
      });
    }
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
      if (__DEV__) {
        console.info('[PushDevice] fcm token delivered to webview', { platform: this.platform });
      }
    } catch (error) {
      if (__DEV__) console.warn('[PushDevice] token delivery failed', error);
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
        source: 'push',
      });
      navigationRef.dispatch(StackActions.push('Stack', { path: toStackWebUrl(`/compare/notice?${params}`) }));
      return;
    }

    if (destination.kind === 'guardianKindergarten') {
      navigationRef.navigate('Tabs', { screen: 'Compare' });
      this.setCompareTabPet(destination.petId, destination.date);
      this.setPrefersGuardianView('Compare', true);
      return;
    }

    if (destination.kind === 'ownerMemberApprovals') {
      navigationRef.navigate('Tabs', { screen: 'OwnerMembers' });
      navigationRef.dispatch(StackActions.push('Stack', { path: toStackWebUrl('/owner/members/approval') }));
      this.setPrefersGuardianView('OwnerMembers', false);
      return;
    }

    if (destination.kind === 'connectionApplyStatus') {
      navigationRef.navigate('Tabs', { screen: 'Mypage' });
      navigationRef.dispatch(StackActions.push('Stack', { path: toStackWebUrl('/guardian/connection-apply/status') }));
      return;
    }

    if (destination.kind === 'album') {
      const params = new URLSearchParams({
        schoolId: destination.schoolId,
        date: destination.date,
      });
      navigationRef.navigate('Tabs', { screen: 'Compare' });
      navigationRef.dispatch(StackActions.push('Stack', { path: toStackWebUrl(`/compare/album?${params}`) }));
      this.setPrefersGuardianView('Compare', true);
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
        var url = new URL(window.location.href);
        url.searchParams.set('pushPetId', petId);
        url.searchParams.set('source', 'push');
        url.searchParams.delete('pushDate');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      })(); true;
    `);
  }

  /** 푸시가 원장/보호자 전용 탭으로 강제 이동시킨 뒤, 다른 탭으로 넘어가도
   * 모드가 되돌아가지 않도록 웹 쪽의 뷰 선호도를 같이 맞춘다.
   *
   * 콜드 마운트인 탭은 이 시점에 웹뷰 ref는 있어도 페이지 JS가 아직 안 떴을 수 있다.
   * 한 번만 주입하면 그 타이밍에 걸려 조용히 무시될 수 있으므로, 짧은 기간 동안 여러 번
   * 반복 주입해 최소 한 번은 페이지가 실제로 뜬 뒤에 적중하게 한다. localStorage 쓰기는
   * 멱등이라 여러 번 실행돼도 안전하다. */
  private setPrefersGuardianView(tabName: TabName, value: boolean, attempt = 0) {
    const webView = tabWebViewStore.get(tabName)?.current;
    if (webView) {
      webView.injectJavaScript(`
        (function() {
          try {
            localStorage.setItem('MYPAGE_ROLE_VIEW', JSON.stringify({ state: { prefersGuardianView: ${value} }, version: 0 }));
          } catch (e) {}
          if (window.__knockdogSetPrefersGuardianView) window.__knockdogSetPrefersGuardianView(${value});
        })(); true;
      `);
    }

    if (attempt < 6) {
      setTimeout(() => this.setPrefersGuardianView(tabName, value, attempt + 1), 300);
    }
  }

  private toDestinationKey(destination: PushDestination) {
    if (destination.kind !== 'fallback') return destination.dedupeKey;
    return 'fallback';
  }
}

export const pushCoordinator = new PushCoordinator();
