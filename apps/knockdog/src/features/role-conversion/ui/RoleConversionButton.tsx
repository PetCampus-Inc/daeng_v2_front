'use client';

import type { ReactNode } from 'react';

import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface RoleConversionButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
}

function RoleConversionButton({
  children,
  className,
  disabled = false,
  title,
  onClick,
}: RoleConversionButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'bg-fill-primary-500 text-text-primary-inverse body1-bold flex h-14 w-full items-center justify-between px-4',
        disabled && 'cursor-not-allowed opacity-80',
        className
      )}
    >
      <span>{children}</span>
      <Icon icon='Change' className='size-6 shrink-0' />
    </button>
  );
}

export { RoleConversionButton };
export type { RoleConversionButtonProps };
