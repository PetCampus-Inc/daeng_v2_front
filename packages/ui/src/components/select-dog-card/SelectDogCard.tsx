import { type ReactNode } from 'react';

import { ChevronBottom } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const SELECT_DOG_VARIANT = {
  closed: 'closed',
  open: 'open',
  list: 'list',
} as const;

type SelectDogVariant = keyof typeof SELECT_DOG_VARIANT;

const PHOTO_SIZE = {
  closed: 'size-[50px]',
  open: 'size-[60px]',
  list: 'size-[46px]',
} as const;

interface SelectDogCardProps {
  variant?: SelectDogVariant;
  isExpanded?: boolean;
  name?: string;
  breed?: string;
  age?: string;
  weight?: string;
  showIcon?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

function DetailDots({ items }: { items: string[] }) {
  return (
    <span className='body2-regular text-text-secondary gap-x1 flex items-center'>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className='gap-x1 flex items-center'>
          {index > 0 ? <span className='bg-text-secondary size-x0_5 rounded-full' /> : null}
          {item}
        </span>
      ))}
    </span>
  );
}

/** V4 / Select Dog / Profile Card */
function SelectDogCard({
  variant = 'closed',
  isExpanded = false,
  name = '찹츄',
  breed = '골든리트리버',
  age = '3살',
  weight = '20Kg',
  showIcon = true,
  children,
  className,
  onClick,
}: SelectDogCardProps) {
  const isList = variant === 'list';
  const isOpen = variant === 'open' || isExpanded;
  const details = [breed, age, weight].filter((item) => item.length > 0);

  return (
    <button
      type='button'
      aria-expanded={isList ? undefined : isOpen}
      onClick={onClick}
      className={cn(
        'gap-x4 flex w-full items-center justify-between text-left',
        isList
          ? 'px-x4 py-x3'
          : 'bg-bg-0 px-x6 py-x5 rounded-b-[var(--radius-r5)] shadow-[0_11px_24px_rgba(235,213,189,0.1)]',
        className
      )}
    >
      <span className='gap-x4 flex min-w-0 items-center'>
        <span
          className={cn(
            'bg-fill-secondary-100 block shrink-0 overflow-hidden rounded-full',
            isList ? PHOTO_SIZE.list : isOpen ? PHOTO_SIZE.open : PHOTO_SIZE.closed
          )}
        >
          {children}
        </span>
        <span className='gap-x0_5 flex min-w-0 flex-col items-start'>
          <span className={cn(isList ? 'body1-extrabold' : 'h3-extrabold', 'text-text-primary')}>{name}</span>
          <DetailDots items={details} />
        </span>
      </span>
      {showIcon && !isList ? (
        <span className='bg-bg-50 flex size-x8 shrink-0 items-center justify-center rounded-full'>
          <ChevronBottom
            className={cn('text-text-secondary size-x4 transition-transform', isOpen && 'rotate-180')}
          />
        </span>
      ) : null}
    </button>
  );
}

export { SelectDogCard, SELECT_DOG_VARIANT };
export type { SelectDogCardProps, SelectDogVariant };
