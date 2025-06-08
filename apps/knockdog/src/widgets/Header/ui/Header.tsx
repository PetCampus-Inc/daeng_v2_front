'use client';

import { ComponentProps, createContext } from 'react';
import BackButton from './BackButton';
import Title from './Title';
import ShareButton from './ShareButton';
import MenuButton from './MenuButton';
import CloseButton from './CloseButton';
import InputField from './InputField';
import { cn } from '@knockdog/ui/lib';
import { HeaderVariant, HeaderContext } from '../model/useHeaderContext';

export function Header({
  className,
  variant = 'solid',
  children,
  ...props
}: ComponentProps<'header'> & {
  variant?: HeaderVariant;
}) {
  const variantClass = {
    solid: 'bg-white',
    transparent: 'bg-transparent',
  };
  return (
    <HeaderContext.Provider value={{ className, variant }}>
      <header
        className={cn(
          'fixed left-0 top-0 z-10 w-full px-4 py-5',
          variantClass[variant],
          className
        )}
        {...props}
      >
        <div className='flex h-[26px] items-center justify-between'>
          {children}
        </div>
      </header>
    </HeaderContext.Provider>
  );
}

function RightSection({ children, ...props }: ComponentProps<'div'>) {
  return (
    <div className='flex items-center gap-x-1' {...props}>
      {children}
    </div>
  );
}

Header.BackButton = BackButton;
Header.Title = Title;
Header.RightSection = RightSection;
Header.ShareButton = ShareButton;
Header.MenuButton = MenuButton;
Header.CloseButton = CloseButton;
Header.InputField = InputField;
