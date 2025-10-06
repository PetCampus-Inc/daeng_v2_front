'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { METHODS } from '@knockdog/bridge-core';

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

type PushOptions = {
  pathname: string; // 예) '/detail'
  query?: Query; // URL에 남겨도 되는 값들만
  replace?: boolean; // 기본 false
  scroll?: boolean; // Next Router 옵션
};

function buildHref(pathname: string, query?: Query, searchParams?: URLSearchParams | null) {
  const params = new URLSearchParams(searchParams || undefined);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function useStackNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bridge = useBridge();

  const isNative = useMemo(() => isNativeWebView(), []);

  const push = useCallback(
    async (options: PushOptions) => {
      const { pathname, query, replace, scroll } = options;

      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${pathname}`;

      if (isNative) {
        await bridge.request(METHODS.navPush, { name: fullPath, params: { query } });
        return;
      }

      // Web Fallback
      const href = buildHref(pathname, query, searchParams);
      replace ? router.replace(href, { scroll }) : router.push(href, { scroll });
    },
    [bridge, router, isNative, searchParams]
  );

  const back = useCallback(async () => {
    if (isNative) {
      await bridge.request(METHODS.navBack, {});
      return;
    }

    router.back();
  }, [bridge, router, isNative]);

  const replace = useCallback(
    async ({ pathname, query, scroll }: Omit<PushOptions, 'replace'>) => {
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${pathname}`;

      if (isNative) {
        await bridge.request(METHODS.navReplace, { name: fullPath, params: { query } });
        return;
      }

      // Web Fallback
      const href = buildHref(pathname, query, searchParams);
      router.replace(href, { scroll });
    },
    [isNative, bridge, router, searchParams]
  );

  const reset = useCallback(
    async (pathname: string = '/', query?: Query) => {
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${pathname}`;

      if (isNative) {
        await bridge.request(METHODS.navReset, { name: fullPath, params: { query } });
        return;
      }

      // Web Fallback
      const href = buildHref(pathname, query);
      router.replace(href);
    },
    [bridge, router, isNative]
  );

  return { push, back, replace, reset };
}

export { useStackNavigation };
