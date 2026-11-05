import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const timeFieldBoxVariants = cva(
  'radius-r3 bg-bg-0 flex min-w-0 flex-1 items-center justify-between border border-solid py-x4 pr-x3 pl-x4',
  {
    variants: {
      tone: {
        default: 'border-line-200',
        error: 'border-error',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  }
);

type TimeRangeState = 'default' | 'filled' | 'error';

interface TimeRangeFieldProps extends VariantProps<typeof timeFieldBoxVariants> {
  startTime: string;
  endTime: string;
  state?: TimeRangeState;
  errorMessage?: ReactNode;
  className?: string;
  onStartClick?: ComponentProps<'button'>['onClick'];
  onEndClick?: ComponentProps<'button'>['onClick'];
}

function ChevronDown(props: ComponentProps<'svg'>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M18 9L12 15L6 9' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function TimeField({
  value,
  tone,
  muted,
  onClick,
}: {
  value: string;
  tone: 'default' | 'error';
  muted: boolean;
  onClick?: ComponentProps<'button'>['onClick'];
}) {
  return (
    <button type='button' onClick={onClick} className={timeFieldBoxVariants({ tone })}>
      <span className={cn('body1-medium', muted ? 'text-text-secondary-inverse' : 'text-text-primary')}>{value}</span>
      <ChevronDown className='text-text-secondary-inverse shrink-0' />
    </button>
  );
}

/** V4 / Input / Time Range */
function TimeRangeField({
  startTime,
  endTime,
  state = 'default',
  errorMessage,
  className,
  onStartClick,
  onEndClick,
}: TimeRangeFieldProps) {
  const isMuted = state === 'default';

  return (
    <div className={cn('flex w-full flex-col gap-x2', className)}>
      <div className='flex w-full items-center'>
        <TimeField value={startTime} tone={state === 'error' ? 'error' : 'default'} muted={isMuted} onClick={onStartClick} />
        <span className='body1-regular text-fill-secondary-500 shrink-0 px-x1'>~</span>
        <TimeField value={endTime} tone='default' muted={isMuted} onClick={onEndClick} />
      </div>
      {state === 'error' && errorMessage ? (
        <p className='caption1-regular text-error px-x2 whitespace-nowrap'>{errorMessage}</p>
      ) : null}
    </div>
  );
}

export { TimeRangeField };
export type { TimeRangeFieldProps, TimeRangeState };
