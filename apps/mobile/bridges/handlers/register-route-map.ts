import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';

type NaverRouteMode = 'car' | 'public' | 'walk' | 'bicycle';
type NaverOpenRouteParams = {
  mode: NaverRouteMode;
  to: { lat: number; lng: number; name?: string };
  from?: { lat: number; lng: number; name?: string };
};

const NAVER_STORE_URL =
  Platform.OS === 'ios' ? 'https://apps.apple.com/app/id311867728' : 'market://details?id=com.nhn.android.nmap';

function buildRouteQueryParams(params: NaverOpenRouteParams, appname: string): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (params.from?.lat != null && params.from?.lng != null) {
    queryParams.set('slat', String(params.from.lat));
    queryParams.set('slng', String(params.from.lng));
    if (params.from.name) queryParams.set('sname', params.from.name);
  }

  queryParams.set('dlat', String(params.to.lat));
  queryParams.set('dlng', String(params.to.lng));
  if (params.to.name) queryParams.set('dname', params.to.name);

  queryParams.set('appname', appname);

  return queryParams;
}

function buildNmapSchemeUrl(params: NaverOpenRouteParams, appname: string) {
  const queryParams = buildRouteQueryParams(params, appname);
  return `nmap://route/${params.mode}?${queryParams.toString()}`;
}

function registerRouteMapHandlers(router: NativeBridgeRouter) {
  router.register<NaverOpenRouteParams>(METHODS.naverOpenRoute, async (params) => {
    const appname = Application.applicationId ?? 'app';
    const schemeUrl = buildNmapSchemeUrl(params, appname);

    // 1. 네이버 지도 앱 설치 여부 확인 후 열기 시도
    const canOpen = await Linking.canOpenURL(schemeUrl);
    if (canOpen) {
      await Linking.openURL(schemeUrl);
      return { opened: true };
    }

    // 2. Android는 canOpenURL이 false여도 intent로 열릴 수 있음 (manifest query 선언 없어도)
    if (Platform.OS === 'android') {
      try {
        await Linking.openURL(schemeUrl);
        return { opened: true, via: 'android-intent-fallback' };
      } catch (error) {
        console.error('Android intent fallback failed:', error);
        // 진짜 안 됨, 스토어로 폴백
      }
    }

    // 3. 앱 미설치 → 스토어로
    await Linking.openURL(NAVER_STORE_URL);
    return { ok: false, reason: 'store_fallback' };
  });
}

export { registerRouteMapHandlers };
