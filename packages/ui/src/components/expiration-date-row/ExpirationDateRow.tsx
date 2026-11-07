import { type ReactNode } from 'react';

import { CalendarV4 } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

interface ExpirationDateRowProps {
  label?: ReactNode;
  date: ReactNode;
  className?: string;
  onClick?: () => void;
}

const expirationDateRowClass = 'bg-bg-0 flex w-full items-center justify-between py-x4';

/** V4 / Information / Expiration Date */
function ExpirationDateRow({ label = '만료일', date, className, onClick }: ExpirationDateRowProps) {
  const body = (
    <>
      <span className='body2-regular text-text-secondary'>{label}</span>
      <span className='flex items-center gap-x2'>
        <span className='body1-medium text-text-primary'>{date}</span>
        <CalendarV4 />
      </span>
    </>
  );

  if (!onClick) return <div className={cn(expirationDateRowClass, className)}>{body}</div>;

  return (
    <button type='button' onClick={onClick} className={cn(expirationDateRowClass, 'cursor-pointer', className)}>
      {body}
    </button>
  );
}

export { ExpirationDateRow };
export type { ExpirationDateRowProps };
