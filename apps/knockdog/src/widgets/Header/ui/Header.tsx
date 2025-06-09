'use client';

import { ComponentProps } from 'react';
import BackButton from './BackButton';
import Title from './Title';
import ShareButton from './ShareButton';
import MenuButton from './MenuButton';
import CloseButton from './CloseButton';
import InputField from './InputField';
import HomeButton from './HomeButton';
import { cn } from '@knockdog/ui/lib';
import { type HeaderVariant } from '@widgets/Header/model/HeaderProvider';

export function Header({
  className,
  variant = 'solid',
  children,
  ...props
}: ComponentProps<'header'> & {
  variant?: HeaderVariant;
  fontColor?: string;
}) {
  const variantClass = {
    solid: 'bg-white',
    transparent: 'bg-transparent',
  };

  return (.
    <header
      className={cn(
        'z-15 fixed left-0 top-0 w-full px-4 py-5',
        variantClass[variant],
        className
      )}
      {...props}
    >
      <div className='flex h-[26px] items-center justify-between'>
        {children}
      </div>
    </header>
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

Header.BackButton = BackButton;
Header.Title = Title;
Header.RightSection = RightSection;
Header.ShareButton = ShareButton;
Header.MenuButton = MenuButton;
Header.CloseButton = CloseButton;
Header.InputField = InputField;
Header.HomeButton = HomeButton;
Header.LeftSection = LeftSection;
