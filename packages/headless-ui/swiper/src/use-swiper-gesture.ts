import { useRef } from 'react';
import type { UseSwiperReturn } from './use-swiper';

interface UseSwiperGestureOptions {
  threshold?: number;
}

function useSwiperGesture(
  api: UseSwiperReturn,
  trackRef: React.RefObject<HTMLDivElement | null>,
  { threshold = 0.1 }: UseSwiperGestureOptions = {}
) {
  const { translateX, canGoNext, next, prev, canGoPrev } = api;

  const isDragging = useRef(false);
  const startX = useRef(0);

  // 드래그 시작 시점 트랙의 translateX 값을 (px)로 저장
  const startTranslatePx = useRef(0);

  const percentToPx = (percent: number, width: number) =>
    (percent / 100) * width;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!trackRef.current || !e.touches[0]) return;
    isDragging.current = true;

    startX.current = e.touches[0].clientX;

    // 현재 % 단위인 translateX 을 px 로 환산
    const trackWidth = trackRef.current.offsetWidth;
    startTranslatePx.current = percentToPx(translateX, trackWidth);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - startX.current;

    // 터치가 얼마나 이동했는지
    // 엣지에서는 반대 방향 드래그 무시
    if (dx > 0 && !canGoPrev) return; // 맨 왼쪽에서 오른쪽 드래그 금지
    if (dx < 0 && !canGoNext) return; // 맨 오른쪽에서 왼쪽 드래그 금지

    trackRef.current.style.transform = `translateX(${
      startTranslatePx.current + dx
    }px)`;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;

    isDragging.current = false;

    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - startX.current;
    const trackWidth = trackRef.current.offsetWidth;
    const thresholdPx = trackWidth * threshold;

    // 왼쪽으로 스와이프 (dx < 0) → 다음 슬라이드
    if (dx < -thresholdPx && canGoNext) {
      next();
    }
    // 오른쪽으로 스와이프 (dx > 0) → 이전 슬라이드
    else if (dx > thresholdPx && canGoPrev) {
      prev();
    } else {
      trackRef.current.style.transform = `translateX(${startTranslatePx.current}px)`;
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

export { useSwiperGesture };
