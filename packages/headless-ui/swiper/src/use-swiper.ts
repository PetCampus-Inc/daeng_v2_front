// use-swiper.ts
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getChildren } from './get-children';

export interface UseSwiperProps {
  initialIndex?: number;
  slidesPerView?: number;
  slideStep?: number;
  loop?: boolean;
  children: React.ReactNode;
  onSlideChange?: (currentIndex: number) => void;
}

export type UseSwiperReturn = ReturnType<typeof useSwiper>;

export function useSwiper(props: UseSwiperProps) {
  const { initialIndex = 0, slidesPerView = 1, slideStep = 1, loop = false, children, onSlideChange } = props;

  const originalSlides = useMemo(() => getChildren(children), [children]);
  const totalSlides = originalSlides.length;

  const head = loop ? originalSlides.slice(-slidesPerView) : [];
  const tail = loop ? originalSlides.slice(0, slidesPerView) : [];

  const slides = useMemo(
    () => (loop ? [...head, ...originalSlides, ...tail] : originalSlides),
    [originalSlides, loop, slidesPerView]
  );

  const maxVirtual = Math.max(0, totalSlides - slidesPerView);
  const clampReal = (i: number) => Math.max(0, Math.min(i, maxVirtual));

  const initialReal = clampReal(initialIndex);
  const initialVirtual = loop ? initialReal + slidesPerView : initialReal;

  const [virtualIndex, setVirtualIndex] = useState(initialVirtual);

  useEffect(() => {
    const nextMaxVirtual = Math.max(0, (originalSlides.length ?? 0) - slidesPerView);
    const nextReal = clampReal(initialIndex);
    const nextVirtual = loop ? nextReal + slidesPerView : nextReal;
    setVirtualIndex(nextVirtual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides, slidesPerView, loop, initialIndex]);

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
    const realIndex = clampReal(index);
    setVirtualIndex(loop ? realIndex + slidesPerView : realIndex);
  };

  const currentIndex = useMemo(() => {
    if (!loop) return virtualIndex;
    if (totalSlides === 0) return 0;
    return (((virtualIndex - slidesPerView) % totalSlides) + totalSlides) % totalSlides;
  }, [virtualIndex, slidesPerView, totalSlides, loop]);

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
