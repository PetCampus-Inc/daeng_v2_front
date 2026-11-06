'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  /** 스크롤 최상단에서만 동작 */
  disabled?: boolean;
  /** 새로고침 트리거 당김 거리(px) */
  threshold?: number;
  /** 인디케이터 최대 높이(px)*/
  maxPullDistance?: number;
}

interface UsePullToRefreshResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

/**
 * 최상단 당겨서 새로고침.
 * - 당김: 상단 로딩 인디케이터 노출
 * - 해제(threshold 이상): onRefresh → 1페이지부터 재조회
 * - 완료: 인디케이터 숨김
 */
function usePullToRefresh({
  onRefresh,
  disabled = false,
  threshold = 72,
  maxPullDistance = 90,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const setDistance = useCallback((value: number) => {
    pullDistanceRef.current = value;
    setPullDistance(value);
  }, []);

  const resetPull = useCallback(() => {
    pullingRef.current = false;
    setDistance(0);
  }, [setDistance]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshingRef.current) return;
      if (el.scrollTop > 0) return;
      const touch = event.touches[0];
      if (!touch) return;
      startYRef.current = touch.clientY;
      pullingRef.current = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!pullingRef.current || isRefreshingRef.current) return;
      if (el.scrollTop > 0) {
        resetPull();
        return;
      }

      const touch = event.touches[0];
      if (!touch) return;
      const delta = touch.clientY - startYRef.current;
      if (delta <= 0) {
        setDistance(0);
        return;
      }

      event.preventDefault();
      const damped = Math.min(delta * 0.45, maxPullDistance);
      setDistance(damped);
    };

    const handleTouchEnd = () => {
      if (!pullingRef.current || isRefreshingRef.current) return;

      const shouldRefresh = pullDistanceRef.current >= threshold;
      if (!shouldRefresh) {
        resetPull();
        return;
      }

      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setDistance(maxPullDistance);
      pullingRef.current = false;

      void Promise.resolve(onRefreshRef.current()).finally(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setDistance(0);
      });
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', resetPull);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', resetPull);
    };
  }, [disabled, maxPullDistance, resetPull, setDistance, threshold]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling: pullDistance > 0 || isRefreshing,
  };
}

export { usePullToRefresh };
export type { UsePullToRefreshOptions, UsePullToRefreshResult };
