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

/**
 * 앱 전역 미로그인 차단.
 * hydrate 전에는 children을 그대로 렌더해 LCP/CLS를 막고,
 * hydrate 후 세션 없으면 로그인으로 reset.
 */
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

  // hydrate 전 null이면 LCP가 통째로 밀림 (Perf 하락 원인).
  // 하위 PrivateAccess가 mount 전 API를 막는다.
  if (!isHydrated) return children;
  if (!hasAuthSession()) return null;

  return children;
}

export { RequireAuthGate };
