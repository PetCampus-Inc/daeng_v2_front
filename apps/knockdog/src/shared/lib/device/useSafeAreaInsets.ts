'use client';

import { useQuery } from '@tanstack/react-query';
import { getSafeAreaInsets } from './getSafeAreaInsets';
import type { SafeAreaInsets } from '@knockdog/bridge-core';

const DEFAULT_INSETS: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };

declare global {
  interface Window {
    __SAFE_AREA_INSETS__?: SafeAreaInsets;
  }
}

/**
 * Safe Area Insets Hook
 *
 * @deprecated 레이아웃(style) 용도로는 사용을 권장하지 않습니다.
 * 대신 CSS 변수(`var(--safe-area-inset-top)` 등)를 사용하세요.
 *
 * CSS 변수는 Hydration 이슈 없이 즉시 적용되므로 레이아웃 깜빡임이 없습니다.
 * 이 Hook은 로직 계산이 필요할 때만 제한적으로 사용하세요.
 */
export function useSafeAreaInsets() {
  const { data } = useQuery({
    queryKey: ['safeAreaInsets'],
    queryFn: getSafeAreaInsets,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: () => {
      if (typeof window !== 'undefined' && window.__SAFE_AREA_INSETS__) {
        return window.__SAFE_AREA_INSETS__;
      }
      return undefined;
    },
  });
  return data ?? DEFAULT_INSETS;
}
