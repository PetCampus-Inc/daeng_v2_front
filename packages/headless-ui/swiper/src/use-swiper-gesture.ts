// use-swiper-gesture.ts
'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import type { UseSwiperReturn } from './use-swiper';

const SWIPE_DIRECTION_THRESHOLD_PX = 6;
const SWIPE_DISTANCE_LIMIT_PX = 32;

export interface UseSwiperGestureOptions {
  threshold?: number; // swipe 임계치(%)
}

export type UseSwiperGestureReturn = ReturnType<typeof useSwiperGesture>;

export function useSwiperGesture(
  api: UseSwiperReturn,
  trackRef: React.RefObject<HTMLDivElement | null>,
  options: UseSwiperGestureOptions = {}
) {
  const { threshold = 0.1 } = options;
  const {
    loop,
    next,
    prev,
    canGoNext,
    canGoPrev,
    slidesPerView,
    virtualIndex,
    totalSlides,
    slideTo,
  } = api;

  // 드래그 오프셋(px) / 트랜지션 설정
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [transition, setTransition] = useState('transform 300ms ease-out');

  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslate = useRef(0);
  const isDragging = useRef(false);
  const suppressClick = useRef(false);

  const slideWidthPct = 100 / slidesPerView;

  // transitionend → clone 구간 벗어나면 real 위치로 점프
  useEffect(() => {
    if (!loop) return;
    const node = trackRef.current;
    if (!node) return;
    const handleEnd = (event: TransitionEvent) => {
      if (event.target !== node || event.propertyName !== 'transform') return;
      let v = virtualIndex;
      if (v >= totalSlides + slidesPerView) {
        // 오른쪽 끝 clone
        slideTo(0);
        setTransition('none');
      } else if (v < slidesPerView) {
        // 왼쪽 끝 clone
        slideTo(totalSlides - slidesPerView);
        setTransition('none');
      }
    };
    node.addEventListener('transitionend', handleEnd);
    return () => node.removeEventListener('transitionend', handleEnd);
  }, [virtualIndex, loop, slidesPerView, totalSlides, slideTo]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || e.button !== 0 || pointerId.current !== null) return;
    suppressClick.current = false;
    if (!trackRef.current || totalSlides <= slidesPerView) return;
    if (loop && (virtualIndex < slidesPerView || virtualIndex >= totalSlides + slidesPerView)) return;

    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || pointerId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;
    if (!isDragging.current) {
      const dy = e.clientY - startY.current;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DIRECTION_THRESHOLD_PX) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        pointerId.current = null;
        suppressClick.current = true;
        return;
      }

      isDragging.current = true;
      suppressClick.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      const { transform } = window.getComputedStyle(trackRef.current);
      startTranslate.current = new DOMMatrixReadOnly(transform).m41;
      setTransition('none');
    }

    const isAtEdge = (dx > 0 && !canGoPrev) || (dx < 0 && !canGoNext);
    setDragOffset(startTranslate.current + (isAtEdge ? 0 : dx));
  };

  const resetPointer = () => {
    pointerId.current = null;
    if (!isDragging.current) return;

    isDragging.current = false;
    setDragOffset(null);
    setTransition('transform 300ms ease-out');
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || pointerId.current !== e.pointerId) return;
    const didDrag = isDragging.current;
    resetPointer();
    if (!didDrag) return;

    const dx = e.clientX - startX.current;
    const width = trackRef.current.offsetWidth;
    const thresholdPx = Math.min(width * threshold, SWIPE_DISTANCE_LIMIT_PX);

    if (dx < -thresholdPx && canGoNext) {
      next();
    } else if (dx > thresholdPx && canGoPrev) {
      prev();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current === e.pointerId) resetPointer();
  };

  const handleLostPointerCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handlePointerCancel(e);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current || e.detail === 0) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
    handleClickCapture,
    slideWidth: slideWidthPct,
    rootStyle: {
      overflow: 'hidden',
      position: 'relative',
      touchAction: 'pan-y',
    } as React.CSSProperties,
    trackStyle: {
      display: 'flex',
      transform:
        dragOffset != null
          ? `translateX(${dragOffset}px)`
          : `translateX(-${virtualIndex * slideWidthPct}%)`,
      transition,
      cursor: dragOffset != null ? 'grabbing' : 'grab',
    } as React.CSSProperties,
    slideStyle: {
      flexShrink: 0,
      width: `${slideWidthPct}%`,
      display: 'block',
      transitionProperty: 'transform',
    } as React.CSSProperties,
  };
}
