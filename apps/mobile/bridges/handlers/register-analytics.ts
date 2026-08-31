import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import {
  METHODS,
  type AnalyticsLogEventParams,
  type AnalyticsLogScreenViewParams,
} from '@knockdog/bridge-core';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';

let collectionEnabled = false;

async function ensureAnalyticsCollection() {
  if (collectionEnabled) return;
  try {
    const analytics = getAnalytics(getApp());
    await setAnalyticsCollectionEnabled(analytics, true);
    collectionEnabled = true;
  } catch (error) {
    console.warn('[analytics] setAnalyticsCollectionEnabled failed', error);
  }
}

function registerAnalyticsHandlers(router: NativeBridgeRouter) {
  router.register(METHODS.analyticsLogEvent, async (params: AnalyticsLogEventParams) => {
    const name = params?.name?.trim();
    if (!name) {
      throw { code: 'EINVALID', message: 'analytics event name is required' };
    }

    await ensureAnalyticsCollection();

    const analytics = getAnalytics(getApp());
    await logEvent(analytics, name, params.params ?? {});
    return { ok: true as const };
  });

  router.register(METHODS.analyticsLogScreenView, async (params: AnalyticsLogScreenViewParams) => {
    const screenName = params?.screen_name?.trim();
    if (!screenName) {
      throw { code: 'EINVALID', message: 'analytics screen_name is required' };
    }

    const screenClass = params.screen_class?.trim() || screenName;

    await ensureAnalyticsCollection();

    const analytics = getAnalytics(getApp());
    // firebase_screen / firebase_screen_class 는 예약 파라미터 → error 14.
    // screen_name / screen_class 만 넘긴다.
    await logEvent(analytics, 'screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
    });
    return { ok: true as const };
  });
}

export { registerAnalyticsHandlers };
