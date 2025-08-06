'use client';

import * as React from 'react';
import { Swiper as SwiperPrimitive } from '@daeng-design/react-swiper';
import { cn } from '@knockdog/ui/lib';

interface SwiperRootProps extends SwiperPrimitive.RootProps {
  className?: string;
}

const SwiperRoot = React.forwardRef<HTMLDivElement, SwiperRootProps>(
  (props, ref) => {
    const { children, className, ...restProps } = props;

    return (
      <SwiperPrimitive.Root
        className={cn(className, '')}
        ref={ref}
        {...restProps}
      >
        {children}
      </SwiperPrimitive.Root>
    );
  }
);
SwiperRoot.displayName = 'SwiperRoot';

interface SwiperSlideItemProps extends SwiperPrimitive.SlideItemProps {
  index?: number;
}

const SwiperSlideItem = React.forwardRef<HTMLDivElement, SwiperSlideItemProps>(
  (props, ref) => {
    const { children, index, ...restProps } = props;

    return (
      <SwiperPrimitive.SlideItem ref={ref} index={index} {...restProps}>
        {children}
      </SwiperPrimitive.SlideItem>
    );
  }
);
SwiperSlideItem.displayName = 'SwiperSlideItem';

export { SwiperRoot, SwiperSlideItem };
