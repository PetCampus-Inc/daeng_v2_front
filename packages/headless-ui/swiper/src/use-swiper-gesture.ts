// use-swiper-gesture.ts
'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import type { UseSwiperReturn } from './use-swiper';

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
  const startTranslate = useRef(0);

  const slideWidthPct = 100 / slidesPerView;

  // transitionend → clone 구간 벗어나면 real 위치로 점프
  useEffect(() => {
    if (!loop) return;
    const node = trackRef.current;
    if (!node) return;
    const handleEnd = () => {
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
    if (!trackRef.current) return;
    pointerId.current = e.pointerId;
    startX.current = e.clientX;

    const style = window.getComputedStyle(trackRef.current);
    const matrix = new DOMMatrixReadOnly(style.transform);
    startTranslate.current = matrix.m41;

    setTransition('none');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || pointerId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;
    if (dx > 0 && !canGoPrev) return;
    if (dx < 0 && !canGoNext) return;
    setDragOffset(startTranslate.current + dx);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || pointerId.current !== e.pointerId) return;
    pointerId.current = null;

    const dx = e.clientX - startX.current;
    const width = trackRef.current.offsetWidth;
    const thresholdPx = width * threshold;

    if (dx < -thresholdPx && canGoNext) {
      next();
    } else if (dx > thresholdPx && canGoPrev) {
      prev();
    }

    setDragOffset(null);
    setTransition('transform 300ms ease-out');
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
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
