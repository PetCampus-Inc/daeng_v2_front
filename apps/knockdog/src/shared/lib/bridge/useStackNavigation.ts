'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';
import { METHODS, makeId } from '@knockdog/bridge-core';

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;
type Params = Record<string, unknown>;

type PushOptions = {
  pathname: string; // 예: '/detail'
  query?: Query; // URL에 남겨도 되는 값
  params?: Params; // 다음 스택에 전달할 데이터
  replace?: boolean;
  scroll?: boolean;
};

function buildHref(pathname: string, query?: Query, searchParams?: URLSearchParams | null) {
  const params = query ? new URLSearchParams(searchParams || undefined) : new URLSearchParams();

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
      const { pathname, query, params, replace, scroll } = options;

      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      if (isNative) {
        // 네이티브 환경 — Bridge로 params도 함께 전달
        if (params) {
          const txId = makeId();
          await bridge.request(METHODS.navPush, {
            name: fullPath,
            params: { query, _txId: txId, _params: params },
          });
        } else {
          await bridge.request(METHODS.navPush, {
            name: fullPath,
            params: { query },
          });
        }
        return;
      }

      // 웹 환경 Fallback
      let finalQuery = query;

      if (params) {
        // params가 있을 때만 txId 생성 및 sessionStorage에 저장
        const txId = makeId();
        sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        finalQuery = { ...query, _txId: txId };
      }

      const href = buildHref(pathname, finalQuery, searchParams);

      // replace 또는 push에 따라 분기
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
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
    async ({ pathname, query, params, scroll }: Omit<PushOptions, 'replace'>) => {
      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      if (isNative) {
        if (params) {
          const txId = makeId();
          await bridge.request(METHODS.navReplace, {
            name: fullPath,
            params: { query, _txId: txId, _params: params },
          });
        } else {
          await bridge.request(METHODS.navReplace, {
            name: fullPath,
            params: { query },
          });
        }
        return;
      }

      let finalQuery = query;

      if (params) {
        const txId = makeId();
        sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        finalQuery = { ...query, _txId: txId };
      }

      const href = buildHref(pathname, finalQuery, searchParams);
      router.replace(href, { scroll });
    },
    [isNative, bridge, router, searchParams]
  );

  const reset = useCallback(
    async (pathname: string = '/', query?: Query, params?: Params) => {
      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      if (isNative) {
        if (params) {
          const txId = makeId();
          await bridge.request(METHODS.navReset, {
            name: fullPath,
            params: { query, _txId: txId, _params: params },
          });
        } else {
          await bridge.request(METHODS.navReset, {
            name: fullPath,
            params: { query },
          });
        }
        return;
      }

      let finalQuery = query;

      if (params) {
        const txId = makeId();
        sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        finalQuery = { ...query, _txId: txId };
      }

      const href = buildHref(pathname, finalQuery);
      router.replace(href);
    },
    [bridge, router, isNative]
  );

  /**
   * 현재 페이지로 전달된 params를 가져옴
   */
  const getParams = useCallback(<T = Params>(): T | null => {
    if (typeof window === 'undefined') return null;

    const state = window.history.state;

    // 네이티브 환경 — history.state에 _params 또는 query에서 읽기
    if (isNative) {
      if (state?._params) {
        return state._params as T;
      }
      // Fallback: query에서 읽기 (URL 쿼리 파라미터)
      if (state?.query) {
        return state.query as T;
      }
      return null;
    }

    // 웹 환경 — sessionStorage에서 params 읽기
    // history.state에서 txId를 못 가져오면 URL query에서 가져오기
    let txId = state?._txId;

    if (!txId) {
      const urlParams = new URLSearchParams(window.location.search);
      txId = urlParams.get('_txId');
    }

    if (!txId) return null;

    try {
      const stored = sessionStorage.getItem(`nav_params_${txId}`);
      if (!stored) return null;

      // 사용 후 삭제
      sessionStorage.removeItem(`nav_params_${txId}`);
      return JSON.parse(stored) as T;
    } catch (e) {
      console.error('Failed to parse params:', e);
      return null;
    }
  }, [isNative]);

  return { push, back, replace, reset, getParams };
}

export { useStackNavigation };
