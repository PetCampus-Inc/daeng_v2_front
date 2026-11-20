import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface TicketEmptyCardProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: ComponentProps<'button'>['onClick'];
}

/** V4 / Card / Ticket Empty State */
function TicketEmptyCard({
  title = '아직 사용중인 이용권이 없어요',
  description = '이용권을 충전하면 등원 예약이 가능해요',
  actionLabel = '충전하기',
  onAction,
  className,
  ...props
}: TicketEmptyCardProps) {
  return (
    <div className={cn('radius-r4 bg-bg-0 w-full py-x5 pr-x3 pl-x4', className)} {...props}>
      <div className='flex flex-col gap-x2'>
        <p className='body1-bold text-text-primary'>{title}</p>
        <p className='body2-regular text-text-secondary'>{description}</p>
      </div>
      <button
        type='button'
        onClick={onAction}
        className='body1-bold text-fill-secondary-500 radius-r3 border-line-200 bg-bg-0 mt-x4 flex w-full items-center justify-center border border-solid p-x4'
      >
        {actionLabel}
      </button>
    </div>
  );
}

export { TicketEmptyCard };
export type { TicketEmptyCardProps };
