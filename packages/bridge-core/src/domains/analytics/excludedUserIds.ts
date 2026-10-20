/** 운영 GA에 집계하지 않는 user_id. */
const EXCLUDED_ANALYTICS_USER_IDS = new Set(['4LPWCATV', 'PN0N0P6S']);

function isExcludedAnalyticsUserId(userId: string | null | undefined) {
  if (typeof userId !== 'string') return false;
  const trimmed = userId.trim();
  return trimmed.length > 0 && EXCLUDED_ANALYTICS_USER_IDS.has(trimmed);
}

export { isExcludedAnalyticsUserId };
