import { type ReactNode } from 'react';

import { ChevronRight } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { RsvStatusBadge, type RsvStatus } from '../rsv-status-badge';

interface RsvStatusCardProps {
  status?: RsvStatus;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/** V4 / Reservation Status Card */
function RsvStatusCard({
  status = 'confirmed',
  children = '11월 3일 (화) 오전 9:00',
  className,
  onClick,
}: RsvStatusCardProps) {
  const isConfirmed = status === 'confirmed';

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'bg-bg-0 py-x4 pr-x3 pl-x4 flex w-full items-center justify-between text-left',
        isConfirmed && 'border-line-200 radius-r3 gap-x2 border border-solid',
        className
      )}
    >
      <span className='flex min-w-0 flex-1 items-center justify-between'>
        <span className='body1-medium text-text-primary'>{children}</span>
        <RsvStatusBadge status={status} />
      </span>
      {isConfirmed ? <ChevronRight className='text-text-primary size-x4 shrink-0' /> : null}
    </button>
  );
}

export { RsvStatusCard };
export type { RsvStatusCardProps };
