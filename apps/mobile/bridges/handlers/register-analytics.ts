import { getAnalytics, logEvent, setAnalyticsCollectionEnabled, setUserId } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import {
  isExcludedAnalyticsUserId,
  METHODS,
  type AnalyticsLogEventParams,
  type AnalyticsLogScreenViewParams,
  type AnalyticsSetUserIdParams,
} from '@knockdog/bridge-core';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';

let collectionEnabled = false;
let collectionBlocked = false;

async function ensureAnalyticsCollection() {
  if (collectionBlocked || collectionEnabled) return;
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

    if (collectionBlocked) return { ok: true as const };

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

    if (collectionBlocked) return { ok: true as const };

    await ensureAnalyticsCollection();

    const analytics = getAnalytics(getApp());
    // firebase_screen / firebase_screen_class 는 예약 파라미터 → error 14.
    // screen_name / screen_class 만 넘긴다.
    await logEvent(analytics, 'screen_view', {
      ...(params.params ?? {}),
      screen_name: screenName,
      screen_class: screenClass,
    });
    return { ok: true as const };
  });

  router.register(METHODS.analyticsSetUserId, async (params: AnalyticsSetUserIdParams) => {
    const rawUserId = params?.user_id;
    const userId = typeof rawUserId === 'string' && rawUserId.trim() ? rawUserId.trim() : null;
    const blocked = params?.collection_enabled === false || isExcludedAnalyticsUserId(userId);
    const analytics = getAnalytics(getApp());

    if (blocked) {
      collectionBlocked = true;
      collectionEnabled = false;
      await setAnalyticsCollectionEnabled(analytics, false);
      await setUserId(analytics, null);
      return { ok: true as const };
    }

    collectionBlocked = false;
    await setAnalyticsCollectionEnabled(analytics, true);
    collectionEnabled = true;
    await setUserId(analytics, userId);
    return { ok: true as const };
  });
}

export { registerAnalyticsHandlers };
