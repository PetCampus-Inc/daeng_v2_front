'use client';

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

import { useUserStore } from '@entities/user';
import { isNativeWebView } from '@shared/lib/device';

import { resolveSentryUserRole } from '../lib/sentryUserRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
import { useOwnerRole } from '../model/useOwnerRole';

function SentryUserSync() {
  const userId = useUserStore((state) => state.user?.userId ?? null);
  const { isOwner, isResolved } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const [isUserHydrated, setIsUserHydrated] = useState(() => useUserStore.persist?.hasHydrated?.() ?? true);
  const [isRoleViewHydrated, setIsRoleViewHydrated] = useState(
    () => useMypageRoleViewStore.persist?.hasHydrated?.() ?? true
  );

  useEffect(() => {
    if (useUserStore.persist?.hasHydrated?.()) {
      setIsUserHydrated(true);
      return;
    }

    return useUserStore.persist?.onFinishHydration?.(() => {
      setIsUserHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (useMypageRoleViewStore.persist?.hasHydrated?.()) {
      setIsRoleViewHydrated(true);
      return;
    }

    return useMypageRoleViewStore.persist?.onFinishHydration?.(() => {
      setIsRoleViewHydrated(true);
    });
  }, []);

  useEffect(() => {
    Sentry.setTag('platform', isNativeWebView() ? 'webview' : 'web');
  }, []);

  useEffect(() => {
    if (!isUserHydrated) return;
    Sentry.setUser(userId ? { id: String(userId) } : null);
  }, [isUserHydrated, userId]);

  useEffect(() => {
    if (!isUserHydrated || !isRoleViewHydrated) return;

    Sentry.setTag('user_role', resolveSentryUserRole(isResolved, isOwner, prefersGuardianView));
  }, [isOwner, isResolved, isRoleViewHydrated, isUserHydrated, prefersGuardianView]);

  return null;
}

export { SentryUserSync };
