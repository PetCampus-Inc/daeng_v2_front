import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { METHODS, type AnalyticsLogEventParams } from '@knockdog/bridge-core';
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
}

export { registerAnalyticsHandlers };
