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

/** 콜드 마운트 웹뷰에 강아지/뷰모드 선택을 주입하는 재시도 설정.
 * 안드로이드는 콜드스타트 시 웹뷰 JS 하이드레이션이 iOS보다 느린 경우가 많아,
 * 기존 1.8초(300ms×6회) 창 안에 못 뜨면 조용히 씹혔다. 4.5초(300ms×15회)로 늘려
 * 저사양 기기의 느린 하이드레이션도 창 안에 들어오게 한다. */
const INJECT_RETRY_MAX_ATTEMPTS = 15;
const INJECT_RETRY_INTERVAL_MS = 300;

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
      // 알림함 진입 시(useNotificationInboxDeepLink.ts)와 동일하게, 강아지가 있으면
      // 유치원 탭에서 보고 있는 강아지도 같이 맞춰준다.
      if (destination.petId) this.setSelectedGuardianPet('Compare', destination.petId);
      return;
    }

    navigationRef.navigate('Tabs', { screen: 'Explore' });
  }

  /** 콜드 마운트인 Compare 탭은 ref가 생겨도 페이지 JS가 아직 안 떴을 수 있어, 한 번만
   * 주입하면 조용히 씹힐 수 있다. 짧은 기간 동안 여러 번 반복 주입해 최소 한 번은
   * 페이지가 실제로 뜬 뒤에 적중하게 한다. history.replaceState는 멱등이라 안전하다. */
  private setCompareTabPet(petId: string, _date?: string, attempt = 0) {
    const compareWebView = tabWebViewStore.get('Compare')?.current;
    if (compareWebView) {
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

    if (attempt < INJECT_RETRY_MAX_ATTEMPTS) {
      setTimeout(() => this.setCompareTabPet(petId, _date, attempt + 1), INJECT_RETRY_INTERVAL_MS);
    }
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

    if (attempt < INJECT_RETRY_MAX_ATTEMPTS) {
      setTimeout(() => this.setPrefersGuardianView(tabName, value, attempt + 1), INJECT_RETRY_INTERVAL_MS);
    }
  }

  /** 알림함(useNotificationInboxDeepLink.ts album case)과 동일하게, 유치원 탭에서
   * 보고 있는 강아지(useGuardianSelectedPetStore)를 앨범 알림이 가리키는 강아지로 맞춘다.
   * knockdog:guardian-selected-pet 이벤트는 이미 웹 쪽에 리스너가 준비돼 있다
   * (useGuardianSelectedPetStore.ts). 콜드 마운트 대비 localStorage도 같이 써둔다. */
  private setSelectedGuardianPet(tabName: TabName, petId: string, attempt = 0) {
    const webView = tabWebViewStore.get(tabName)?.current;
    if (webView) {
      const serializedPetId = serializeForJS(petId);
      webView.injectJavaScript(`
        (function() {
          var petId = ${serializedPetId};
          try {
            localStorage.setItem('GUARDIAN_SELECTED_PET', JSON.stringify({ state: { selectedPetId: petId }, version: 0 }));
          } catch (e) {}
          window.dispatchEvent(new CustomEvent('knockdog:guardian-selected-pet', { detail: { petId: petId } }));
        })(); true;
      `);
    }

    if (attempt < INJECT_RETRY_MAX_ATTEMPTS) {
      setTimeout(() => this.setSelectedGuardianPet(tabName, petId, attempt + 1), INJECT_RETRY_INTERVAL_MS);
    }
  }

  private toDestinationKey(destination: PushDestination) {
    if (destination.kind !== 'fallback') return destination.dedupeKey;
    return 'fallback';
  }
}

export const pushCoordinator = new PushCoordinator();
