'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { METHODS } from '@knockdog/bridge-core';
import { buildHref, type Query } from './queryUtils';

type TabRoute =
  | '/'
  | '/search'
  | '/save'
  | '/compare'
  | '/mypage'
  | '/owner'
  | '/owner/daily'
  | '/owner/album'
  | '/owner/members';

// Main 탭 경로 목록
const MAIN_TAB_ROUTES: readonly string[] = [
  '/',
  '/search',
  '/save',
  '/compare',
  '/mypage',
  '/owner',
  '/owner/daily',
  '/owner/album',
  '/owner/members',
] as const;

function useTabNavigation() {
  const router = useRouter();
  const bridge = useBridge();
  const pathname = usePathname();

  const isNative = useMemo(() => isNativeWebView(), []);

  const navigateToTab = useCallback(
    async (pathname: TabRoute, query?: Query, mode?: 'owner' | 'guardian') => {
      if (isNative) {
        // 네이티브 환경: 탭 전환 (애니메이션 없이 즉시 전환)
        // mode를 넘기면, Stack 화면(예: 초대 완료)에서도 탭 이름 계산 전에 네이티브
        // 메인탭 모드를 먼저 반영한다. navSetMainTabMode는 Stack 화면 요청을 거부하므로
        // 그 경로 대신 게이트가 없는 이 브릿지에 실어 보낸다.
        await bridge.request(METHODS.navSwitchTab, {
          pathname,
          ...(query && { query }),
          ...(mode && { mode }),
        });
        return;
      }

      // 웹: replace로 탭 전환 — push면 알림장 리스트 등이 뒤로가기에 남음
      const href = buildHref(pathname, query);
      router.replace(href);
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
