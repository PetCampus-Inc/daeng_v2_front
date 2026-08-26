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
  const isRehydratingRef = useRef(false);
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
      // 빠른 탭 전환 직후 백그라운드→포그라운드 복귀 시 visibilitychange가 짧은 간격으로
      // 여러 번 발생할 수 있다. rehydrate가 겹쳐 실행되면 먼저 시작된 rehydrate가 나중
      // 것보다 늦게 끝나며 최신 user 상태를 stale 값으로 덮어써 원장/보호자 뷰가
      // 오락가락하는 원인이 될 수 있어, 진행 중에는 새 rehydrate를 건너뛴다.
      if (isRehydratingRef.current) return;

      isRehydratingRef.current = true;

      rehydrateUserStore()
        .then(() => {
          const currentAuth = checkAuth();
          if (!currentAuth && !isNavigatingRef.current) {
            return handleLogin();
          }
          return undefined;
        })
        .catch(() => undefined)
        .finally(() => {
          isRehydratingRef.current = false;
        });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth, handleLogin]);

  return hasAuth;
}
