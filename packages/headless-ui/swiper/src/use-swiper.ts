import { useState, useMemo } from 'react';
import { getChildren } from './get-children';

interface UseSwiperProps {
  slidesPerView?: number;
  slideStep?: number;
  loop?: boolean;
  children: React.ReactNode;
}

type UseSwiperReturn = ReturnType<typeof useSwiper>;

function useSwiper(props: UseSwiperProps) {
  const { slidesPerView = 1, slideStep = 1, loop = false, children } = props;

  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = getChildren(children);
  const totalSlides = slides.length;

  // slidesPerView를 고려한 실제 이동 가능한 최대 인덱스
  const maxIndex = useMemo(() => {
    return Math.max(0, totalSlides - slidesPerView);
  }, [totalSlides, slidesPerView]);

  // 슬라이드 크기 계산 (100% / slidesPerView)
  const slideWidth = useMemo(() => {
    return 100 / slidesPerView;
  }, [slidesPerView]);

  // translateX 계산 (현재 인덱스 * 슬라이드 너비)
  const currentTranslateX = useMemo(() => {
    return -(currentIndex * slideWidth);
  }, [currentIndex, slideWidth]);

  const next = () => {
    if (loop) {
      // 루프가 true인 경우: 맨 마지막에서 첫 번째로
      setCurrentIndex((prev) => (prev + slideStep) % (maxIndex + 1));
    } else {
      // 루프가 false인 경우: 마지막 슬라이드에서 정지
      setCurrentIndex((prev) => {
        const newIndex = prev + slideStep;
        return newIndex > maxIndex ? maxIndex : newIndex;
      });
    }
  };

  const prev = () => {
    if (loop) {
      // 루프가 true인 경우: 첫 번째에서 맨 마지막으로
      setCurrentIndex((prev) => {
        const newIndex = prev - slideStep;
        return newIndex < 0 ? maxIndex + newIndex + 1 : newIndex;
      });
    } else {
      // 루프가 false인 경우: 첫 번째 슬라이드에서 정지
      setCurrentIndex((prev) => Math.max(prev - slideStep, 0));
    }
  };

  const goTo = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
  };

  const translateTo = (translateX: number, duration: number = 0) => {
    // translateX를 픽셀 단위로 받아서 처리
    const trackElement = document.querySelector(
      '[data-swiper-track]'
    ) as HTMLElement;
    if (trackElement) {
      trackElement.style.transition =
        duration > 0 ? `transform ${duration}ms ease-out` : 'none';
      trackElement.style.transform = `translateX(${translateX}px)`;
    }
  };

  const slideTo = (index: number, duration: number = 300) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
  };

  // 이동 가능 여부 체크
  const canGoNext = loop || currentIndex < maxIndex;
  const canGoPrev = loop || currentIndex > 0;

  return {
    next,
    prev,
    goTo,
    translateTo,
    slideTo,
    currentIndex,
    activeIndex: currentIndex,
    translateX: currentTranslateX,
    slideWidth,
    maxIndex,
    canGoNext,
    canGoPrev,
    getRootProps() {
      return {
        role: 'group',
        style: {
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative' as const,
          touchAction: 'pan-y',
        },
      };
    },
    getTrackProps() {
      return {
        'data-swiper-track': '',
        style: {
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative' as const,
          cursor: 'grab',
          transform: `translateX(${currentTranslateX}%)`,
          transition: 'transform 300ms ease-out',
        },
      };
    },
    getSlideProps() {
      return {
        style: {
          flexShrink: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          transitionProperty: 'transform',
        },
      };
    },
  };
}

export { useSwiper };
export type { UseSwiperProps, UseSwiperReturn };
