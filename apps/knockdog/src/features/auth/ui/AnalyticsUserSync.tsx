'use client';

import { useEffect, useState } from 'react';

import { useUserStore } from '@entities/user';
import { resolveScreenName, syncAnalyticsUserId, trackMemberAppUse } from '@shared/lib/analytics';

function kstDateKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function trackMemberAppUseForToday(userId: string) {
  const screenName =
    resolveScreenName(window.location.pathname) ??
    document.title.replace(/^똑독\s*-\s*/, '').trim();
  if (!screenName) return;

  const storageKey = `analytics_member_app_use:${userId}`;
  const today = kstDateKey();
  if (window.localStorage.getItem(storageKey) === today) return;
  window.localStorage.setItem(storageKey, today);
  trackMemberAppUse({ screen_name: screenName });
}

function AnalyticsUserSync() {
  const userId = useUserStore((state) => state.user?.userId ?? null);
  const [isHydrated, setIsHydrated] = useState(() => useUserStore.persist?.hasHydrated?.() ?? true);

  useEffect(() => {
    if (useUserStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
      return;
    }

    return useUserStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    syncAnalyticsUserId(userId);
    if (!userId) return;

    trackMemberAppUseForToday(userId);
    const handleVisible = () => {
      if (document.visibilityState !== 'visible') return;
      trackMemberAppUseForToday(userId);
    };
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('appresume', handleVisible);
    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('appresume', handleVisible);
    };
  }, [isHydrated, userId]);

  return null;
}

export { AnalyticsUserSync };
