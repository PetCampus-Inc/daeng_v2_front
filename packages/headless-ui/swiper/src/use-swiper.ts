import { useState, useMemo, useEffect } from 'react';
import { getChildren } from './get-children';

interface UseSwiperProps {
  slidesPerView?: number;
  slideStep?: number;
  loop?: boolean;
  children: React.ReactNode;
  onSlideChange?: (currentIndex: number) => void;
}

type UseSwiperReturn = ReturnType<typeof useSwiper>;

function useSwiper(props: UseSwiperProps) {
  const {
    slidesPerView = 1,
    slideStep = 1,
    loop = false,
    children,
    onSlideChange,
  } = props;

  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = getChildren(children);
  const totalSlides = slides.length;

  // slidesPerView를 고려한 실제 이동 가능한 최대 인덱스
  const maxIndex = useMemo(() => {
    return Math.max(0, totalSlides - slidesPerView);
  }, [totalSlides, slidesPerView]);

  // currentIndex가 바뀔 때 onSlideChange 호출
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex, onSlideChange]);

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

  const slideTo = (index: number) => {
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
    slideTo,
    currentIndex,
    slidesPerView,
    activeIndex: currentIndex,
    maxIndex,
    canGoNext,
    canGoPrev,
  };
}

export { useSwiper };
export type { UseSwiperProps, UseSwiperReturn };
