'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { isPublicUnauthenticatedPath } from '@shared/lib/auth/isPublicUnauthenticatedPath';
import { navigateToLogin } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';

function hasAuthSession() {
  return !!useUserStore.getState().user || tokenUtils.hasAccessToken();
}

/**
 * 앱 전역 미로그인 차단.
 * 공개 경로가 아니면 로그인으로 reset한다 (게스트/비로그인 탭 사용 불가).
 */
function RequireAuthGate() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(
    () => useUserStore.persist?.hasHydrated?.() ?? true
  );

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
    if (isPublicUnauthenticatedPath(pathname)) return;
    if (hasAuthSession()) return;

    navigateToLogin().catch(() => undefined);
  }, [isHydrated, pathname, user]);

  return null;
}

export { RequireAuthGate };
