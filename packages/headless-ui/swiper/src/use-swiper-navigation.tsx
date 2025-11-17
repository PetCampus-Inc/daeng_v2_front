import { useCallback, useMemo } from 'react';
import type { UseSwiperReturn } from './use-swiper';
import { getSwiperNavigation } from './get-children';

export interface UseSwiperNavigationOptions {
  children?: React.ReactNode;
}

export type UseSwiperNavigationReturn = ReturnType<typeof useSwiperNavigation>;

export function useSwiperNavigation(api: UseSwiperReturn, options: UseSwiperNavigationOptions = {}) {
  const { children } = options;
  const { next, prev, slideTo, canGoNext, canGoPrev, loop, currentIndex, totalSlides } = api;

  const isPrevDisabled = useMemo(() => !canGoPrev, [canGoPrev]);
  const isNextDisabled = useMemo(() => !canGoNext, [canGoNext]);

  // children에서 SwiperNavigation 컴포넌트만 추출
  const navigationComponent = useMemo(() => {
    if (!children) return null;

    return getSwiperNavigation(children);
  }, [children]);

  const getPrevButtonProps = useCallback(
    (): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': '이전 슬라이드',
      disabled: isPrevDisabled,
      onClick: prev,
    }),
    [prev, isPrevDisabled]
  );

  const getNextButtonProps = useCallback(
    (): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': '다음 슬라이드',
      disabled: isNextDisabled,
      onClick: next,
    }),
    [next, isNextDisabled]
  );

  /** 키보드(←/→, ↑/↓), 마우스 휠 이벤트 핸들러 */
  const getRootProps = useCallback(() => {
    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prev();
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next();
      }
    };

    let wheelLock = false;
    const onWheel: React.WheelEventHandler<HTMLElement> = (e) => {
      if (wheelLock) return;
      if (Math.abs(e.deltaY) < 20 && Math.abs(e.deltaX) < 20) return; // 작은 흔들림 무시
      wheelLock = true;
      if (e.deltaY > 0 || e.deltaX > 0) {
        next();
      } else {
        prev();
      }
      setTimeout(() => {
        wheelLock = false;
      }, 500); // 디바운스
    };

    return { tabIndex: 0, onKeyDown, onWheel };
  }, [next, prev]);

  return {
    next,
    prev,
    slideTo,
    getPrevButtonProps,
    getNextButtonProps,
    getRootProps,
    isPrevDisabled,
    isNextDisabled,
    navigationComponent, // 추출된 네비게이션 컴포넌트
  };
}
