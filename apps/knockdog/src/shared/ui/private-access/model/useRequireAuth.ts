'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { tokenUtils } from '@shared/utils';
import { route } from '@shared/constants/route';

export function useRequireAuth(): boolean {
  const user = useUserStore((state) => state.user);
  const { replace } = useStackNavigation();
  const isNavigatingRef = useRef(false);
  const pathname = usePathname(); // 현재 페이지 경로

  const hasAuth = !!user || tokenUtils.hasAccessToken();

  useEffect(() => {
    if (hasAuth) return;
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;

    const handleLogin = async () => {
      try {
        await replace({
          pathname: route.auth.login.root,
          params: {
            redirectTo: pathname,
          },
        });
      } catch (error) {
        console.error('로그인 페이지 이동 중 오류:', error);
      } finally {
        isNavigatingRef.current = false;
      }
    };

    handleLogin();
  }, [hasAuth, pathname, replace]);

  return hasAuth;
}
