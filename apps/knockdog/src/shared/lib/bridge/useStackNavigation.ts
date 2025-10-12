'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBridge, useBridgeContext } from './BridgeProvider';
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
  const { consumePendingTxId } = useBridgeContext();

  const isNative = useMemo(() => isNativeWebView(), []);

  const push = useCallback(
    async (options: PushOptions) => {
      const { pathname, query, params, replace, scroll } = options;

      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      // BridgeProvider에서 pending txId 가져오기 (useNavigationResult.wait()가 설정)
      const pendingTxId = consumePendingTxId();
      // pendingTxId가 있거나 params가 있으면 txId 필요
      const needsTxId = !!pendingTxId || !!params;
      // txId: pending이 있으면 사용, 아니면 새로 생성
      const txId = needsTxId ? pendingTxId || makeId() : null;

      if (isNative) {
        // 네이티브 환경 — Bridge로 params도 함께 전달
        if (txId) {
          await bridge.request(METHODS.navPush, {
            name: fullPath,
            params: {
              ...(query && { query }),
              _txId: txId,
              ...(params && { _params: params }),
            },
          });
        } else {
          await bridge.request(METHODS.navPush, {
            name: fullPath,
            ...(query && { params: { query } }),
          });
        }
        return;
      }

      // 웹 환경 Fallback
      let finalQuery = query;

      if (txId) {
        if (params) {
          // params가 있을 때만 sessionStorage에 저장
          sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        }
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
    [bridge, router, isNative, searchParams, consumePendingTxId]
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

      // BridgeProvider에서 pending txId 가져오기
      const pendingTxId = consumePendingTxId();
      const needsTxId = !!pendingTxId || !!params;
      const txId = needsTxId ? pendingTxId || makeId() : null;

      if (isNative) {
        if (txId) {
          await bridge.request(METHODS.navReplace, {
            name: fullPath,
            params: {
              ...(query && { query }),
              _txId: txId,
              ...(params && { _params: params }),
            },
          });
        } else {
          await bridge.request(METHODS.navReplace, {
            name: fullPath,
            ...(query && { params: { query } }),
          });
        }
        return;
      }

      let finalQuery = query;

      if (txId) {
        if (params) {
          sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        }
        finalQuery = { ...query, _txId: txId };
      }

      const href = buildHref(pathname, finalQuery, searchParams);
      router.replace(href, { scroll });
    },
    [isNative, bridge, router, searchParams, consumePendingTxId]
  );

  const reset = useCallback(
    async (pathname: string = '/', query?: Query, params?: Params) => {
      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      // BridgeProvider에서 pending txId 가져오기
      const pendingTxId = consumePendingTxId();
      const needsTxId = !!pendingTxId || !!params;
      const txId = needsTxId ? pendingTxId || makeId() : null;

      if (isNative) {
        if (txId) {
          await bridge.request(METHODS.navReset, {
            name: fullPath,
            params: {
              ...(query && { query }),
              _txId: txId,
              ...(params && { _params: params }),
            },
          });
        } else {
          await bridge.request(METHODS.navReset, {
            name: fullPath,
            ...(query && { params: { query } }),
          });
        }
        return;
      }

      let finalQuery = query;

      if (txId) {
        if (params) {
          sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        }
        finalQuery = { ...query, _txId: txId };
      }

      const href = buildHref(pathname, finalQuery);
      router.replace(href);
    },
    [bridge, router, isNative, consumePendingTxId]
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
