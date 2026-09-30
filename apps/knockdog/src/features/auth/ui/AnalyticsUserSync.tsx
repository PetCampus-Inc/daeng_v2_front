'use client';

import { useEffect, useState } from 'react';

import { useUserStore } from '@entities/user';
import { syncAnalyticsUserId } from '@shared/lib/analytics';

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
  }, [isHydrated, userId]);

  return null;
}

export { AnalyticsUserSync };
