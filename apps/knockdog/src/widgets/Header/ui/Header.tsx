'use client';

import BackButton from './BackButton';
import Title from './Title';
import ShareButton from './ShareButton';
import MenuButton from './MenuButton';
import CloseButton from './CloseButton';
import InputField from './InputField';
import HomeButton from './HomeButton';
import SearchField from './SearchField';
import { cn } from '@knockdog/ui/lib';
import { type ComponentProps } from 'react';
import type { HeaderVariant } from '../model/HeaderProvider';

export function Header({
  className,
  innerClassName,
  variant = 'solid',
  children,
  ...props
}: ComponentProps<'header'> & {
  variant?: HeaderVariant;
  fontColor?: string;
  innerClassName?: string;
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
        <div className={cn('flex h-16 w-full items-center justify-between', innerClassName)}>{children}</div>
      </header>
    </>
  );
}

function LeftSection({ children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-x-4',
        '[&>button]:relative [&>button]:before:absolute [&>button]:before:-inset-2 [&>button]:before:content-[""]'
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function RightSection({ children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'ml-auto flex items-center gap-x-4',
        '[&>button]:relative [&>button]:before:absolute [&>button]:before:-inset-2 [&>button]:before:content-[""]'
      )}
      {...props}
    >
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
Header.SearchField = SearchField;
