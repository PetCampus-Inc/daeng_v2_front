import * as React from 'react';

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
    });

    const gestureApi = useSwiperGesture(api, trackRef);

    return (
      <div ref={ref} style={gestureApi.rootStyle} {...restProps} role='group'>
        <SwiperContext.Provider value={{ ...api, ...gestureApi }}>
          <div
            ref={trackRef}
            style={gestureApi.trackStyle}
            onPointerDown={gestureApi.handlePointerDown}
            onPointerMove={gestureApi.handlePointerMove}
            onPointerUp={gestureApi.handlePointerUp}
          >
            {...api.slides}
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

    return (
      <SwiperSlideItemContext.Provider value={{ slideWidth: api.slideWidth }}>
        <div ref={ref} style={api.slideStyle} {...restProps}>
          {children}
        </div>
      </SwiperSlideItemContext.Provider>
    );
  }
);
SwiperSlideItem.displayName = 'SwiperSlideItem';

export { SwiperRoot, SwiperSlideItem };
export type { SwiperRootProps, SwiperSlideItemProps };
