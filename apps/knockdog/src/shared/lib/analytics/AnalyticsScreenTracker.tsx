'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

import { trackScreenView } from './gaEvents';
import { normalizePathname, resolveScreenName } from './screenNames';
import {
  getScreenTitleOverride,
  subscribeScreenTitleOverride,
} from './screenTitleOverride';

function AnalyticsScreenTracker() {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname ?? '/');
  const lastLoggedKeyRef = useRef<string | null>(null);

  const overrideTitle = useSyncExternalStore(
    subscribeScreenTitleOverride,
    () => getScreenTitleOverride(normalizedPath),
    () => null
  );

  useEffect(() => {
    const fallback = resolveScreenName(normalizedPath);
    const screenName = overrideTitle || fallback;
    if (!screenName) return;

    const key = `${normalizedPath}::${screenName}`;
    if (lastLoggedKeyRef.current === key) return;
    lastLoggedKeyRef.current = key;

    void trackScreenView(screenName, screenName);
  }, [normalizedPath, overrideTitle]);

  return null;
}

export { AnalyticsScreenTracker };
