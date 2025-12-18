'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { METHODS } from '@knockdog/bridge-core';
import type { Query } from './queryUtils';

// @TODO useStackNavigation에서 동일 코드가 있기 때문에 공통으로 뺴야함
function buildHref(pathname: string, query?: Query) {
  const params = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        // 배열인 경우 각 값을 append하여 ids=aaa&ids=bbb 형식으로 만듦
        for (const item of value) {
          params.append(key, String(item));
        }
      } else {
        params.set(key, String(value));
      }
    }
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

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
