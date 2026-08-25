'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { isPublicUnauthenticatedPath } from '@shared/lib/auth/isPublicUnauthenticatedPath';
import { navigateToLogin } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';

async function rehydrateUserStore() {
  await useUserStore.persist?.rehydrate?.();
}

export function useRequireAuth(onAuthError?: (error: Error) => void): boolean {
  const user = useUserStore((state) => state.user);
  const isNavigatingRef = useRef(false);
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    return !!useUserStore.getState().user || tokenUtils.hasAccessToken();
  }, []);

  const hasAuth = !!user || tokenUtils.hasAccessToken();

  const handleLogin = useCallback(async () => {
    if (isNavigatingRef.current) return;
    if (isPublicUnauthenticatedPath(pathname)) return;

    isNavigatingRef.current = true;

    try {
      // reset으로 로그인만 남김 — 뒤로가기 시 비로그인 탭 복귀 방지
      await navigateToLogin();
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));

      if (onAuthError) {
        onAuthError(errorInstance);
      }
    } finally {
      isNavigatingRef.current = false;
    }
  }, [pathname, onAuthError]);

  useEffect(() => {
    if (hasAuth) return;
    handleLogin().catch(() => undefined);
  }, [hasAuth, handleLogin]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      rehydrateUserStore()
        .then(() => {
          const currentAuth = checkAuth();
          if (!currentAuth && !isNavigatingRef.current) {
            return handleLogin();
          }
          return undefined;
        })
        .catch(() => undefined);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth, handleLogin]);

  return hasAuth;
}
