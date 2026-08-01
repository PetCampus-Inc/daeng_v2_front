'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';
import { route } from '@shared/constants/route';

async function rehydrateUserStore() {
  await useUserStore.persist?.rehydrate?.();
}

export function useRequireAuth(onAuthError?: (error: Error) => void): boolean {
  const user = useUserStore((state) => state.user);
  const { replace, pushForResult } = useStackNavigation();
  const { isMainTab } = useTabNavigation();
  const isNavigatingRef = useRef(false);
  const pathname = usePathname(); // 현재 페이지 경로

  const checkAuth = useCallback(() => {
    return !!useUserStore.getState().user || tokenUtils.hasAccessToken();
  }, []);

  const hasAuth = !!user || tokenUtils.hasAccessToken();

  const handleLogin = useCallback(async () => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;

    try {
      const isMain = isMainTab();

      if (isMain) {
        // Main 탭일 때: stack으로 login 열기 (뒤로가기 시 튕기도록)
        const isLoggedIn = await pushForResult(
          {
            pathname: route.auth.login.root,
          },
          600_000
        );

        if (isLoggedIn) {
          await rehydrateUserStore();
        }
      } else {
        // Stack일 때: replace 사용
        await replace({
          pathname: route.auth.login.root,
          params: {
            redirectTo: pathname,
          },
        });
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));

      if (onAuthError) {
        onAuthError(errorInstance);
      }
    } finally {
      isNavigatingRef.current = false;
    }
  }, [pathname, replace, pushForResult, isMainTab, onAuthError]);

  useEffect(() => {
    if (hasAuth) return;
    handleLogin();
  }, [hasAuth, handleLogin]);

  // 탭/스택 복귀 시 다른 WebView에서 저장한 USER·token 반영 후 재검사
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      void (async () => {
        await rehydrateUserStore();
        const currentAuth = checkAuth();
        if (!currentAuth && !isNavigatingRef.current) {
          handleLogin();
        }
      })();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth, handleLogin]);

  return hasAuth;
}
