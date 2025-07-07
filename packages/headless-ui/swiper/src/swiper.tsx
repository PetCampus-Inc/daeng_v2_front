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
  extends Omit<UseSwiperProps, 'children' | 'trackRef'>,
    React.HTMLAttributes<HTMLDivElement> {}

const SwiperRoot = React.forwardRef<HTMLDivElement, SwiperRootProps>(
  (props, ref) => {
    const {
      children,
      slidesPerView,
      slideStep,
      loop,
      onSlideChange,
      ...restProps
    } = props;

    const trackRef = React.useRef<HTMLDivElement>(null);

    const api = useSwiper({
      slidesPerView,
      slideStep,
      loop,
      children,
      onSlideChange,
      trackRef,
    });
    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useSwiperGesture(api, trackRef);

    return (
      <div ref={ref} {...api.getRootProps()} {...restProps}>
        <SwiperContext.Provider value={api}>
          <div
            ref={trackRef}
            {...api.getTrackProps()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
    const { children, ...restProps } = props;
    const api = useSwiperContext();

    const slideProps = api.getSlideProps();

    return (
      <SwiperSlideItemContext.Provider value={{ slideWidth: api.slideWidth }}>
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
