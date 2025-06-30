import * as React from 'react';

import { getChildren } from './get-children';

import {
  useSwiperContext,
  SwiperContext,
  SwiperSlideItemContext,
} from './use-swiper-context';
import { useSwiper, type UseSwiperProps } from './use-swiper';
import { useSwiperGesture } from './use-swiper-gesture';

// - SwiperRoot: 전체 컨테이너, Context Provider
// - SwiperSlide: 개별 슬라이드

interface SwiperRootProps
  extends Omit<UseSwiperProps, 'children'>,
    React.HTMLAttributes<HTMLDivElement> {}

const SwiperRoot = React.forwardRef<HTMLDivElement, SwiperRootProps>(
  (props, ref) => {
    const {
      children,
      slidesPerView,
      spaceBetween,
      slideStep,
      loop,
      ...restProps
    } = props;

    const api = useSwiper({
      slidesPerView,
      spaceBetween,
      slideStep,
      loop,
      children,
    });

    const trackRef = React.useRef<HTMLDivElement>(null);
    const { handleTouchStart, handleTouchMove, handleTouchEnd } =
      useSwiperGesture(api, trackRef);

    return (
      <div ref={ref} {...api.getRootProps()} {...restProps}>
        <SwiperContext.Provider value={api}>
          <div
            ref={trackRef}
            {...api.getTrackProps()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {children}
          </div>
        </SwiperContext.Provider>
      </div>
    );
  }
);
SwiperRoot.displayName = 'SwiperRoot';

interface SwiperSlideItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
}

const SwiperSlideItem = React.forwardRef<HTMLDivElement, SwiperSlideItemProps>(
  (props, ref) => {
    const { children, index = 0, ...restProps } = props;
    const api = useSwiperContext();

    const slideProps = api.getSlideProps();

    return (
      <SwiperSlideItemContext.Provider
        value={{ index, slideWidth: api.slideWidth }}
      >
        <div ref={ref} style={slideProps.style} {...restProps}>
          {children}
        </div>
      </SwiperSlideItemContext.Provider>
    );
  }
);
SwiperSlideItem.displayName = 'SwiperSlideItem';

export { SwiperRoot, SwiperSlideItem };
export type { SwiperRootProps, SwiperSlideItemProps };
