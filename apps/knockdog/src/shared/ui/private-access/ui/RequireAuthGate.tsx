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
 * 공개 경로가 아니면 hydrate + 세션 확인 전까지 protected subtree를 렌더하지 않고 로그인으로 reset.
 */
function RequireAuthGate({ children }: RequireAuthGateProps) {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(
    () => useUserStore.persist?.hasHydrated?.() ?? true
  );
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
