'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { isPublicUnauthenticatedPath } from '@shared/lib/auth/isPublicUnauthenticatedPath';
import { navigateToLogin } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';

let inFlightRehydrate: Promise<void> | null = null;

/**
 * useUserStore.persist.rehydrate()를 공유 in-flight Promise로 감싼 coordinator.
 *
 * zustand persist 미들웨어는 rehydrate() 동시 호출을 직렬화/중복 제거하지 않아, 서로 다른
 * 호출자가 겹쳐 호출하면 나중에 끝나는 쪽이 먼저 끝난 쪽의 최신 상태를 stale 값으로 덮어쓸
 * 수 있다. 모든 호출자가 이 함수를 통해서만 rehydrate하도록 하여 진행 중인 요청을 재사용한다.
 */
export function rehydrateUserStore(): Promise<void> {
  if (!inFlightRehydrate) {
    inFlightRehydrate = Promise.resolve(useUserStore.persist?.rehydrate?.()).finally(() => {
      inFlightRehydrate = null;
    });
  }
  return inFlightRehydrate;
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
