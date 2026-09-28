'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { isPublicUnauthenticatedPath } from '@shared/lib/auth/isPublicUnauthenticatedPath';
import { navigateToLogin } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';

function hasAuthSession() {
  return !!useUserStore.getState().user || tokenUtils.hasAccessToken();
}

interface RequireAuthGateProps {
  children: ReactNode;
}

function RequireAuthGate({ children }: RequireAuthGateProps) {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(false);
  const isPublicPath = isPublicUnauthenticatedPath(pathname);

  useEffect(() => {
    if (useUserStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
      return;
    }

    const unsubscribe = useUserStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isPublicPath) return;
    if (hasAuthSession()) return;

    navigateToLogin().catch(() => undefined);
  }, [isHydrated, isPublicPath, user]);

  if (isPublicPath) return children;

  if (!isHydrated) return null;
  if (!hasAuthSession()) return null;

  return children;
}

export { RequireAuthGate };
