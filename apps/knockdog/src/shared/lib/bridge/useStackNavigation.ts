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

  /**
   * 내부 helper: 실제 navigation 로직 (txId를 직접 받음)
   * - push, pushForResult가 공통으로 사용
   */
  const executeNavigation = useCallback(
    async (
      method: typeof METHODS.navPush | typeof METHODS.navReplace,
      options: PushOptions,
      forcedTxId?: string | null
    ) => {
      const { pathname, query, params, replace, scroll } = options;

      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      // forcedTxId가 제공되면 사용, params가 있으면 새로 생성, 아니면 null
      const txId = forcedTxId !== undefined ? forcedTxId : params ? makeId() : null;

      if (isNative) {
        // 네이티브 환경
        if (txId) {
          await bridge.request(method, {
            name: fullPath,
            params: {
              ...(query && { query }),
              _txId: txId,
              ...(params && { _params: params }),
            },
          });
        } else {
          await bridge.request(method, {
            name: fullPath,
            ...(query && { params: { query } }),
          });
        }
        return;
      }

      // 웹 환경
      let finalQuery = query;

      if (txId) {
        if (params) {
          sessionStorage.setItem(`nav_params_${txId}`, JSON.stringify(params));
        }
        finalQuery = { ...query, _txId: txId };
      }

      const href = buildHref(pathname, finalQuery, searchParams);

      if (replace || method === METHODS.navReplace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
    },
    [bridge, router, isNative, searchParams]
  );

  const push = useCallback(
    async (options: PushOptions) => {
      await executeNavigation(METHODS.navPush, options);
    },
    [executeNavigation]
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
      await executeNavigation(METHODS.navReplace, { pathname, query, params, scroll });
    },
    [executeNavigation]
  );

  const reset = useCallback(
    async (pathname: string = '/', query?: Query, params?: Params) => {
      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const fullPath = `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`;

      // params가 있으면 txId 생성
      const txId = params ? makeId() : null;

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

      // 웹 환경
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

  /**
   * 결과를 기다리는 push (wait + push 통합)
   * - 순서 강제 없음, BridgeProvider 의존성 없음
   * - useNavigationResult.wait() + push() 대신 이것 하나로 해결
   *
   * @example
   * const result = await navigation.pushForResult<AddressData>({
   *   pathname: '/address-search',
   *   query: { type: 'manual' }
   * });
   */
  const pushForResult = useCallback(
    async <T>(options: Omit<PushOptions, 'replace'>, timeoutMs: number = 30_000): Promise<T> => {
      const txId = makeId();

      // 1. 이벤트 리스너 먼저 등록 (race condition 방지)
      const resultPromise = new Promise<T>((resolve, reject) => {
        let settled = false;

        const timeoutTimer = setTimeout(() => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error(`[pushForResult] 타임아웃: ${timeoutMs}ms 내에 응답이 없습니다. (txId: ${txId})`));
        }, timeoutMs);

        const offResult = bridge.on('nav.result', (payload: any) => {
          if (settled || payload.txId !== txId) return;
          settled = true;
          clearTimeout(timeoutTimer);
          cleanup();
          resolve(payload.result as T);
        });

        const offCancel = bridge.on('nav.cancel', (payload: any) => {
          if (settled || payload.txId !== txId) return;
          settled = true;
          clearTimeout(timeoutTimer);
          cleanup();
          reject(new Error(payload.reason || 'Navigation cancelled'));
        });

        const cleanup = () => {
          try {
            offResult?.();
          } catch {}
          try {
            offCancel?.();
          } catch {}
        };
      });

      // 2. executeNavigation 직접 호출 (forcedTxId 전달)
      await executeNavigation(METHODS.navPush, options, txId);

      // 3. 결과 대기
      return resultPromise;
    },
    [executeNavigation, bridge]
  );

  return { push, pushForResult, back, replace, reset, getParams };
}

export { useStackNavigation };
