'use client';

import { useRef, useState, useMemo } from 'react';
import type { UseSwiperReturn } from './use-swiper';

interface UseSwiperGestureOptions {
  threshold?: number;
}

type UseSwiperGestureReturn = ReturnType<typeof useSwiperGesture>;

function useSwiperGesture(
  api: UseSwiperReturn,
  trackRef: React.RefObject<HTMLDivElement | null>,
  { threshold = 0.1 }: UseSwiperGestureOptions = {}
) {
  const { canGoNext, next, prev, canGoPrev, currentIndex, slidesPerView } = api;

  // 드래그 중 적용할 translate 오프셋
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const [transition, setTransition] = useState('transform 300ms ease-out');

  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);

  // 드래그 시작 시점 트랙의 translateX 값을 (px)로 저장
  const startTranslate = useRef(0);

  // 슬라이드 크기 계산 (100% / slidesPerView)
  const slideWidth = useMemo(() => {
    return 100 / slidesPerView;
  }, [slidesPerView]);

  // translateX 계산 (현재 인덱스 * 슬라이드 너비)
  const currentTranslateX = useMemo(() => {
    return -(currentIndex * slideWidth);
  }, [currentIndex, slideWidth]);

  const getTranslateXByIndex = (index: number) => {
    if (!trackRef.current) return 0;
    const trackWidth = trackRef.current.offsetWidth;
    return -((trackWidth * index) / slidesPerView);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    pointerId.current = e.pointerId;
    startX.current = e.clientX;

    // 현재 % 단위인 translateX 을 px 로 환산
    const style = window.getComputedStyle(trackRef.current);
    const matrix = new DOMMatrixReadOnly(style.transform);
    startTranslate.current = matrix.m41;

    // transition 해제
    setTransition('none');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || pointerId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;

    // 터치가 얼마나 이동했는지
    // 엣지에서는 반대 방향 드래그 무시
    if (dx > 0 && !canGoPrev) return; // 맨 왼쪽에서 오른쪽 드래그 금지
    if (dx < 0 && !canGoNext) return; // 맨 오른쪽에서 왼쪽 드래그 금지

    setDragOffset(startTranslate.current + dx);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || pointerId.current !== e.pointerId) return;
    pointerId.current = null;

    const dx = e.clientX - startX.current;
    const trackWidth = trackRef.current.offsetWidth;
    const thresholdPx = trackWidth * threshold;

    // 왼쪽으로 스와이프 (dx < 0) → 다음 슬라이드
    if (dx < -thresholdPx && canGoNext) {
      next();
    }
    // 오른쪽으로 스와이프 (dx > 0) → 이전 슬라이드
    else if (dx > thresholdPx && canGoPrev) {
      prev();
    }
    setDragOffset(null);
    setTransition('transform 300ms ease-out');
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    slideWidth,
    rootStyle: {
      overflow: 'hidden',
      position: 'relative' as const,
      touchAction: 'pan-y',
    },
    trackStyle: {
      display: 'flex',
      position: 'relative' as const,
      cursor: 'grab',
      transform:
        dragOffset !== null
          ? `translateX(${dragOffset}px)`
          : `translateX(-${currentIndex * slideWidth}%)`,
      transition,
    },
    slideStyle: {
      flexShrink: 0,
      width: `${slideWidth}%`,
      display: 'block',
      transitionProperty: 'transform',
    },
  };
}

export { useSwiperGesture };
export type { UseSwiperGestureReturn };
