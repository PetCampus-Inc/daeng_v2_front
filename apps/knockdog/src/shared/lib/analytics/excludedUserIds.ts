import { isExcludedAnalyticsUserId } from '@knockdog/bridge-core';

import { STORAGE_KEYS } from '@shared/constants/storage';

let blockedOverride: boolean | undefined;

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

/** 로그인 유저가 바뀌기 전에는 persist된 user_id로 판단한다. */
function isAnalyticsCollectionBlocked() {
  if (blockedOverride !== undefined) return blockedOverride;
  return isExcludedAnalyticsUserId(readPersistedUserId());
}

function setAnalyticsCollectionBlocked(userId: string | null) {
  blockedOverride = isExcludedAnalyticsUserId(userId);
  return blockedOverride;
}

export { isAnalyticsCollectionBlocked, isExcludedAnalyticsUserId, setAnalyticsCollectionBlocked };
