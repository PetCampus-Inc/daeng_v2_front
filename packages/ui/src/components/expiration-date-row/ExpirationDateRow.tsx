import { type ReactNode } from 'react';

import { CalendarV4 } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

interface ExpirationDateRowProps {
  label?: ReactNode;
  date: ReactNode;
  className?: string;
}

/** V4 / Information / Expiration Date */
function ExpirationDateRow({ label = '만료일', date, className }: ExpirationDateRowProps) {
  return (
    <div className={cn('bg-bg-0 flex w-full items-center justify-between py-x4', className)}>
      <p className='body2-regular text-text-secondary'>{label}</p>
      <div className='flex items-center gap-x2'>
        <p className='body1-medium text-text-primary'>{date}</p>
        <CalendarV4 />
      </div>
    </div>
  );
}

export { ExpirationDateRow };
export type { ExpirationDateRowProps };
