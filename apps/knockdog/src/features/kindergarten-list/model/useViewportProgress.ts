'use client';

import { useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface UseSheetDragProgressProps {
  minSnapPoint: number;
  maxSnapPointOffset: number;
  enabled?: boolean;
}

/**
 * 바텀시트 드래그 진행도를 계산하는 훅.
 *  요소의 뷰포트를 참조하여 드래그 진행도를 계산합니다.
 *
 * @param minSnapPoint - 최소 스냅포인트
 * @param maxSnapPointOffset - 최대 스냅포인트 오프셋
 * @returns
 */
const useSheetDragProgress = ({ minSnapPoint, maxSnapPointOffset, enabled = true }: UseSheetDragProgressProps) => {
  const viewRef = useRef<HTMLDivElement>(null);

  const dragProgress = useMotionValue(0);

  useEffect(() => {
    if (!enabled) return;
    let rafId: number;
    let lastProgress = -1;
    const threshold = 0.005; // 0.5%

    const calculateProgress = () => {
      if (viewRef.current) {
        const rect = viewRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 바텀시트의 현재 높이
        const currentSheetHeight = viewportHeight - rect.top;

        // 최소/최대 높이
        const minHeight = minSnapPoint;
        const maxHeight = viewportHeight - maxSnapPointOffset;

        // 0-1로 정규화
        const range = maxHeight - minHeight;
        if (range <= 0) {
          rafId = requestAnimationFrame(calculateProgress);
          return;
        }

        const rawProgress = (currentSheetHeight - minHeight) / range;

        const clamped = Math.max(0, Math.min(1, rawProgress));

        if (Math.abs(clamped - lastProgress) >= threshold) {
          dragProgress.set(clamped);
          lastProgress = clamped;
        }
      }

      rafId = requestAnimationFrame(calculateProgress);
    };

    rafId = requestAnimationFrame(calculateProgress);
    return () => cancelAnimationFrame(rafId);
  }, [dragProgress, minSnapPoint, maxSnapPointOffset, enabled]);

  return { viewRef, dragProgress };
};

export { useSheetDragProgress };
