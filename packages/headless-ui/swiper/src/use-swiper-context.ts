import { createContext, useContext } from 'react';
import type { UseSwiperReturn } from './use-swiper';
import type { UseSwiperGestureReturn } from './use-swiper-gesture';

// - SwiperContext: 루트 레벨 상태 공유
// - SwiperSlideContext: 슬라이드별 상태
// - useSwiperContext, useSwiperSlideContext 훅

const SwiperContext = createContext<
  (UseSwiperReturn & UseSwiperGestureReturn) | null
>(null);

function useSwiperContext() {
  const context = useContext(SwiperContext);
  if (!context) {
    throw new Error('useSwiperContext must be used within SwiperContext');
  }
  return context;
}

interface SwiperSlideItemContextValue {
  slideWidth: number;
}

const SwiperSlideItemContext =
  createContext<SwiperSlideItemContextValue | null>(null);
function useSwiperSlideItemContext() {
  const context = useContext(SwiperSlideItemContext);
  if (!context) {
    throw new Error(
      'useSwiperSlideItemContext must be used within SwiperSlideItemContext'
    );
  }

  return context;
}

export {
  SwiperContext,
  SwiperSlideItemContext,
  useSwiperSlideItemContext,
  useSwiperContext,
};
export type { SwiperSlideItemContextValue };
