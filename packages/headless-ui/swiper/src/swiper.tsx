import * as React from 'react';

import { useSwiperContext, SwiperContext, SwiperSlideItemContext } from './use-swiper-context';
import { useSwiper, type UseSwiperProps } from './use-swiper';
import { useSwiperGesture } from './use-swiper-gesture';
import { useSwiperNavigation } from './use-swiper-navigation';

// - SwiperRoot: 전체 컨테이너, Context Provider
// - SwiperSlide: 개별 슬라이드

interface SwiperRootProps extends Omit<UseSwiperProps, 'children'>, React.HTMLAttributes<HTMLDivElement> {
  navigation?: boolean | React.ReactNode;
}

const SwiperRoot = React.forwardRef<HTMLDivElement, SwiperRootProps>((props, ref) => {
  const { children, slidesPerView, slideStep, loop, onSlideChange, initialIndex, navigation, ...restProps } = props;

  const trackRef = React.useRef<HTMLDivElement>(null);

  const api = useSwiper({
    initialIndex,
    slidesPerView,
    slideStep,
    loop,
    children,
    onSlideChange,
  });

  const gestureApi = useSwiperGesture(api, trackRef);
  const navigationApi = useSwiperNavigation(api, { children });

  return (
    <div ref={ref} style={gestureApi.rootStyle} {...restProps} role='group'>
      <SwiperContext.Provider value={{ ...api, ...gestureApi, ...navigationApi }}>
        <div
          ref={trackRef}
          style={gestureApi.trackStyle}
          onPointerDown={gestureApi.handlePointerDown}
          onPointerMove={gestureApi.handlePointerMove}
          onPointerUp={gestureApi.handlePointerUp}
        >
          {...api.slides}
        </div>
        {navigationApi.navigationComponent}
      </SwiperContext.Provider>
    </div>
  );
});
SwiperRoot.displayName = 'SwiperRoot';

interface SwiperSlideItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
}

const SwiperSlideItem = React.forwardRef<HTMLDivElement, SwiperSlideItemProps>((props, ref) => {
  const { children, ...restProps } = props;
  const api = useSwiperContext();

  return (
    <SwiperSlideItemContext.Provider value={{ slideWidth: api.slideWidth }}>
      <div ref={ref} style={api.slideStyle} {...restProps}>
        {children}
      </div>
    </SwiperSlideItemContext.Provider>
  );
});
SwiperSlideItem.displayName = 'SwiperSlideItem';

interface SwiperNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SwiperNavigation = React.forwardRef<HTMLDivElement, SwiperNavigationProps>((props, ref) => {
  const { children, ...restProps } = props;
  const { getRootProps } = useSwiperContext();

  return (
    <div ref={ref} {...getRootProps()} {...restProps}>
      {children}
    </div>
  );
});
SwiperNavigation.displayName = 'SwiperNavigation';

interface SwiperPrevButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const SwiperPrevButton = React.forwardRef<HTMLButtonElement, SwiperPrevButtonProps>((props, ref) => {
  const { children, ...restProps } = props;
  const { getPrevButtonProps } = useSwiperContext();
  return (
    <button ref={ref} {...restProps} {...getPrevButtonProps()}>
      {children}
    </button>
  );
});
SwiperPrevButton.displayName = 'SwiperPrevButton';

interface SwiperNextButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const SwiperNextButton = React.forwardRef<HTMLButtonElement, SwiperNextButtonProps>((props, ref) => {
  const { children, ...restProps } = props;
  const { getNextButtonProps } = useSwiperContext();
  return (
    <button ref={ref} {...restProps} {...getNextButtonProps()}>
      {children}
    </button>
  );
});
SwiperNextButton.displayName = 'SwiperNextButton';

export { SwiperRoot, SwiperSlideItem, SwiperNavigation, SwiperPrevButton, SwiperNextButton };
export type {
  SwiperRootProps,
  SwiperSlideItemProps,
  SwiperNavigationProps,
  SwiperPrevButtonProps,
  SwiperNextButtonProps,
};
