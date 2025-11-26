'use client';

import BackButton from './BackButton';
import Title from './Title';
import ShareButton from './ShareButton';
import MenuButton from './MenuButton';
import CloseButton from './CloseButton';
import InputField from './InputField';
import HomeButton from './HomeButton';
import { cn } from '@knockdog/ui/lib';
import { Suspense, type ComponentProps } from 'react';
import type { HeaderVariant } from '../model/HeaderProvider';

export function Header({
  className,
  variant = 'solid',
  withSpacing = true,
  children,
  ...props
}: ComponentProps<'header'> & {
  variant?: HeaderVariant;
  fontColor?: string;
  withSpacing?: boolean;
}) {
  const variantClass = {
    solid: 'bg-white border-b border-line-100',
    transparent: 'bg-transparent',
  };

  return (
    <>
      <header
        className={cn(
          'border-line-100 sticky top-0 z-15 flex h-16 w-full items-center px-4',
          variantClass[variant],
          className
        )}
        {...props}
      >
        <div className={cn('flex h-16 w-full items-center')}>{children}</div>
      </header>
      {withSpacing && <div className='h-16' />}
    </>
  );
}

function LeftSection({ children, ...props }: ComponentProps<'div'>) {
  return (
    <div className='flex items-center gap-x-1' {...props}>
      {children}
    </div>
  );
}

function RightSection({ children, ...props }: ComponentProps<'div'>) {
  return (
    <div className='flex items-center gap-x-1' {...props}>
      {children}
    </div>
  );
}

function CenterSection({ children, ...props }: ComponentProps<'div'>) {
  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' {...props}>
      {children}
    </div>
  );
}

Header.BackButton = BackButton;
Header.Title = Title;
Header.RightSection = RightSection;
Header.CenterSection = CenterSection;
Header.ShareButton = ShareButton;
Header.MenuButton = MenuButton;
Header.CloseButton = CloseButton;
Header.InputField = InputField;
Header.HomeButton = HomeButton;
Header.LeftSection = LeftSection;
