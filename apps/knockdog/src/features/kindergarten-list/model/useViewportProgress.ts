'use client';

import { useMotionValue } from 'framer-motion';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

interface UseSheetDragProgressProps {
  minSnapPoint: number;
  maxSnapPointOffset: number;
  containerRef?: RefObject<HTMLElement | null>;
  snapOffsetsRef?: RefObject<number[] | null>;
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
const useSheetDragProgress = ({
  minSnapPoint,
  maxSnapPointOffset,
  containerRef,
  snapOffsetsRef,
  enabled = true,
}: UseSheetDragProgressProps) => {
  const viewRef = useRef<HTMLDivElement>(null);

  const dragProgress = useMotionValue(0);

  useEffect(() => {
    if (!enabled) return;
    let rafId: number;
    let lastProgress = -1;
    const threshold = 0.005; // 0.5%
    const snapEpsilon = 0.01; // 스냅 완료 시 0/1로 정렬

    const calculateProgress = () => {
      if (viewRef.current) {
        const rect = viewRef.current.getBoundingClientRect();
        const containerRect = containerRef?.current?.getBoundingClientRect();
        const viewportHeight = containerRect?.height ?? window.innerHeight;
        const containerBottom = containerRect?.bottom ?? window.innerHeight;

        const currentOffset = containerRect ? rect.top - containerRect.top : rect.top;

        const snapOffsets = snapOffsetsRef?.current;
        if (snapOffsets && snapOffsets.length > 1) {
          const minOffset = Math.max(...snapOffsets);
          const maxOffset = Math.min(...snapOffsets);
          const range = minOffset - maxOffset;
          if (range <= 0) {
            rafId = requestAnimationFrame(calculateProgress);
            return;
          }

          const rawProgress = (minOffset - currentOffset) / range;
          const clamped = Math.max(0, Math.min(1, rawProgress));
          const snapped = clamped < snapEpsilon ? 0 : clamped > 1 - snapEpsilon ? 1 : clamped;

          if (Math.abs(snapped - lastProgress) >= threshold) {
            dragProgress.set(snapped);
            lastProgress = snapped;
          }

          rafId = requestAnimationFrame(calculateProgress);
          return;
        }

        // 바텀시트의 현재 높이
        const currentSheetHeight = containerBottom - rect.top;

        // 최소/최대 높이 (fallback)
        const minHeight = minSnapPoint;
        const maxHeight = containerRect ? viewportHeight : viewportHeight - maxSnapPointOffset;

        // 0-1로 정규화
        const range = maxHeight - minHeight;
        if (range <= 0) {
          rafId = requestAnimationFrame(calculateProgress);
          return;
        }

        const rawProgress = (currentSheetHeight - minHeight) / range;

        const clamped = Math.max(0, Math.min(1, rawProgress));
        const snapped = clamped < snapEpsilon ? 0 : clamped > 1 - snapEpsilon ? 1 : clamped;

        if (Math.abs(snapped - lastProgress) >= threshold) {
          dragProgress.set(snapped);
          lastProgress = snapped;
        }
      }

      rafId = requestAnimationFrame(calculateProgress);
    };

    rafId = requestAnimationFrame(calculateProgress);
    return () => cancelAnimationFrame(rafId);
  }, [dragProgress, minSnapPoint, maxSnapPointOffset, enabled, containerRef, snapOffsetsRef]);

  return { viewRef, dragProgress };
};

export { useSheetDragProgress };
