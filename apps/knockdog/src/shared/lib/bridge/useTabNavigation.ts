'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { METHODS } from '@knockdog/bridge-core';
import { buildHref, type Query } from './queryUtils';

type TabRoute = '/' | '/save' | '/compare' | '/mypage';

// Main 탭 경로 목록
const MAIN_TAB_ROUTES: readonly string[] = ['/', '/search', '/save', '/compare', '/mypage'] as const;

function useTabNavigation() {
  const router = useRouter();
  const bridge = useBridge();
  const pathname = usePathname();

  const isNative = useMemo(() => isNativeWebView(), []);

  const navigateToTab = useCallback(
    async (pathname: TabRoute, query?: Query) => {
      if (isNative) {
        // 네이티브 환경: 탭 전환 (애니메이션 없이 즉시 전환)
        await bridge.request(METHODS.navSwitchTab, {
          pathname,
          ...(query && { query }),
        });
        return;
      }

      // 웹 환경: router.push 사용
      const href = buildHref(pathname, query);
      router.push(href);
    },
    [router, bridge, isNative]
  );

  /**
   * 현재 페이지가 Main 탭인지 확인
   * @returns true면 Main 탭, false면 Stack
   */
  const isMainTab = useCallback((): boolean => {
    const normalizedPath = pathname === '' ? '/' : pathname;
    return MAIN_TAB_ROUTES.includes(normalizedPath);
  }, [pathname]);

  return { navigateToTab, isMainTab };
}

export { useTabNavigation };
export type { TabRoute };
