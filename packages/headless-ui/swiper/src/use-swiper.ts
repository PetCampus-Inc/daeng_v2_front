// use-swiper.ts
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getChildren } from './get-children';

export interface UseSwiperProps {
  slidesPerView?: number;
  slideStep?: number;
  loop?: boolean;
  children: React.ReactNode;
  onSlideChange?: (currentIndex: number) => void;
}

export type UseSwiperReturn = ReturnType<typeof useSwiper>;

export function useSwiper(props: UseSwiperProps) {
  const {
    slidesPerView = 1,
    slideStep = 1,
    loop = false,
    children,
    onSlideChange,
  } = props;

  // 원본 슬라이드 배열
  const originalSlides = useMemo(() => getChildren(children), [children]);
  const totalSlides = originalSlides.length;

  // 앞뒤 복제용
  const head = loop ? originalSlides.slice(-slidesPerView) : [];
  const tail = loop ? originalSlides.slice(0, slidesPerView) : [];

  // 최종 사용 슬라이드(클론 포함)
  const slides = useMemo(
    () => (loop ? [...head, ...originalSlides, ...tail] : originalSlides),
    [originalSlides, loop, slidesPerView]
  );

  // 가상 인덱스 초기화
  const initialVirtual = loop ? slidesPerView : 0;
  const [virtualIndex, setVirtualIndex] = useState(initialVirtual);

  // non-loop 모드에서 clamp 할 최대 가상 인덱스
  const maxVirtual = totalSlides - slidesPerView;

  const canGoNext = loop || virtualIndex < maxVirtual;
  const canGoPrev = loop || virtualIndex > 0;

  const next = () => {
    if (loop) {
      setVirtualIndex((v) => v + slideStep);
    } else {
      setVirtualIndex((v) => Math.min(v + slideStep, maxVirtual));
    }
  };

  const prev = () => {
    if (loop) {
      setVirtualIndex((v) => v - slideStep);
    } else {
      setVirtualIndex((v) => Math.max(v - slideStep, 0));
    }
  };

  const goTo = (index: number) => {
    const realIndex = Math.max(0, Math.min(index, maxVirtual));
    setVirtualIndex(loop ? realIndex + slidesPerView : realIndex);
  };

  // 외부에 노출할 “실제” 인덱스 계산
  const currentIndex = useMemo(() => {
    if (!loop) return virtualIndex;
    return (
      (((virtualIndex - slidesPerView) % totalSlides) + totalSlides) %
      totalSlides
    );
  }, [virtualIndex, slidesPerView, totalSlides, loop]);

  // 인덱스 변경 콜백
  useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

  return {
    slides,
    next,
    prev,
    slideTo: goTo,
    currentIndex,
    virtualIndex,
    slidesPerView,
    loop,
    slideStep,
    canGoNext,
    canGoPrev,
    totalSlides,
  };
}
