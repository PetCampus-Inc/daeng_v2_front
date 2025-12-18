'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { METHODS } from '@knockdog/bridge-core';
import { buildHref, type Query } from './queryUtils';

type TabRoute = '/' | '/save' | '/compare' | '/mypage';

function useTabNavigation() {
  const router = useRouter();
  const bridge = useBridge();

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

  return { navigateToTab };
}

export { useTabNavigation };
export type { TabRoute };
