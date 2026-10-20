import { isExcludedAnalyticsUserId } from '@knockdog/bridge-core';

import { STORAGE_KEYS } from '@shared/constants/storage';

const EXCLUDED_DEVICE_KEY = 'analytics_collection_excluded';

let blockedOverride: boolean | undefined;

type AnalyticsBlockListener = (blocked: boolean) => void;

const analyticsBlockListeners = new Set<AnalyticsBlockListener>();

function readPersistedUserId() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { user?: { userId?: unknown } | null } };
    const userId = parsed.state?.user?.userId;
    return typeof userId === 'string' ? userId : null;
  } catch {
    return null;
  }
}

function readExcludedDevice() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(EXCLUDED_DEVICE_KEY) === '1';
}

function writeExcludedDevice(excluded: boolean) {
  if (typeof window === 'undefined') return;
  if (excluded) {
    window.localStorage.setItem(EXCLUDED_DEVICE_KEY, '1');
    return;
  }
  window.localStorage.removeItem(EXCLUDED_DEVICE_KEY);
}

/** 제외 계정이 한 번이라도 로그인했으면 로그아웃 후에도 이 브라우저에서는 막는다. */
function isAnalyticsCollectionBlocked() {
  if (blockedOverride !== undefined) return blockedOverride;
  return isExcludedAnalyticsUserId(readPersistedUserId()) || readExcludedDevice();
}

function setAnalyticsCollectionBlocked(userId: string | null) {
  if (isExcludedAnalyticsUserId(userId)) writeExcludedDevice(true);
  else if (userId) writeExcludedDevice(false);

  const blocked = userId ? isExcludedAnalyticsUserId(userId) : readExcludedDevice();
  blockedOverride = blocked;
  analyticsBlockListeners.forEach((listener) => listener(blocked));
  return blocked;
}

function subscribeAnalyticsCollectionBlocked(listener: AnalyticsBlockListener) {
  analyticsBlockListeners.add(listener);
  return () => {
    analyticsBlockListeners.delete(listener);
  };
}

export {
  isAnalyticsCollectionBlocked,
  isExcludedAnalyticsUserId,
  setAnalyticsCollectionBlocked,
  subscribeAnalyticsCollectionBlocked,
};
