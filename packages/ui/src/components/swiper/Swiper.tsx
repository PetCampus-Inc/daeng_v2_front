'use client';

import * as React from 'react';
import { Swiper as SwiperPrimitive } from '@daeng-design/react-swiper';
import { cn } from '@knockdog/ui/lib';
import { Icon } from '@knockdog/ui';

interface SwiperRootProps extends SwiperPrimitive.RootProps {
  className?: string;
}

const SwiperRoot = React.forwardRef<HTMLDivElement, SwiperRootProps>((props, ref) => {
  const { children, className, navigation = false, ...restProps } = props;

  return (
    <SwiperPrimitive.Root className={cn(className, 'relative')} ref={ref} navigation={navigation} {...restProps}>
      {children}

      {navigation && (
        <SwiperNavigation className='absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-4 py-3'>
          <SwiperPrevButton />
          <SwiperNextButton />
        </SwiperNavigation>
      )}
    </SwiperPrimitive.Root>
  );
});
SwiperRoot.displayName = 'SwiperRoot';

interface SwiperSlideItemProps extends SwiperPrimitive.SlideItemProps {
  index?: number;
}

const SwiperSlideItem = React.forwardRef<HTMLDivElement, SwiperSlideItemProps>((props, ref) => {
  const { children, index, ...restProps } = props;

  return (
    <SwiperPrimitive.SlideItem ref={ref} index={index} {...restProps}>
      {children}
    </SwiperPrimitive.SlideItem>
  );
});
SwiperSlideItem.displayName = 'SwiperSlideItem';

interface SwiperNavigationProps extends SwiperPrimitive.NavigationProps {
  className?: string;
}

const SwiperNavigation = React.forwardRef<HTMLDivElement, SwiperNavigationProps>((props, ref) => {
  const { children, className, ...restProps } = props;

  return (
    <SwiperPrimitive.Navigation ref={ref} className={cn('flex justify-between', className)} {...restProps}>
      {children}
    </SwiperPrimitive.Navigation>
  );
});
SwiperNavigation.displayName = 'SwiperNavigation';

interface SwiperPrevButtonProps extends SwiperPrimitive.PrevButtonProps {
  className?: string;
}

const SwiperPrevButton = React.forwardRef<HTMLButtonElement, SwiperPrevButtonProps>((props, ref) => {
  const { children, className, ...restProps } = props;

  return (
    <SwiperPrimitive.PrevButton
      ref={ref}
      className={cn('rounded-full bg-white/40 p-[10px] hover:bg-white/100', className)}
      {...restProps}
    >
      {children || <Icon icon='ChevronLeft' className='text-text-primary' />}
    </SwiperPrimitive.PrevButton>
  );
});
SwiperPrevButton.displayName = 'SwiperPrevButton';

interface SwiperNextButtonProps extends SwiperPrimitive.NextButtonProps {
  className?: string;
}

const SwiperNextButton = React.forwardRef<HTMLButtonElement, SwiperNextButtonProps>((props, ref) => {
  const { children, className, ...restProps } = props;

  return (
    <SwiperPrimitive.NextButton
      ref={ref}
      className={cn('rounded-full bg-white/40 p-[10px] hover:bg-white/100', className)}
      {...restProps}
    >
      {children || <Icon icon='ChevronRight' className='text-text-primary' />}
    </SwiperPrimitive.NextButton>
  );
});
SwiperNextButton.displayName = 'SwiperNextButton';

export { SwiperRoot, SwiperSlideItem, SwiperNavigation, SwiperPrevButton, SwiperNextButton };
