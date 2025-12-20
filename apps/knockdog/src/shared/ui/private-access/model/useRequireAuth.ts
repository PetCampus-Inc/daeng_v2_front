'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';
import { route } from '@shared/constants/route';

export function useRequireAuth(onAuthError?: (error: Error) => void): boolean {
  const user = useUserStore((state) => state.user);
  const { replace, pushForResult } = useStackNavigation();
  const { isMainTab } = useTabNavigation();
  const isNavigatingRef = useRef(false);
  const pathname = usePathname(); // 현재 페이지 경로

  const checkAuth = () => {
    return !!user || tokenUtils.hasAccessToken();
  };

  const hasAuth = checkAuth();

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
      // console.error('로그인 페이지 이동 중 오류:', error);

      // 에러 핸들러가 제공되면 호출

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

  // visibilitychange 이벤트로 탭이 다시 보일 때마다 인증 상태 체크
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentAuth = checkAuth();
        if (!currentAuth && !isNavigatingRef.current) {
          handleLogin();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleLogin]);

  return hasAuth;
}
