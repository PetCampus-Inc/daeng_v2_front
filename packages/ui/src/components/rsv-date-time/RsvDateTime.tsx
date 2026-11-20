import { type ComponentProps, type ReactNode } from 'react';

import { RsvCalendarFill, RsvClock } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const RSV_DATE_TIME_LABEL = {
  date: { filled: '10월 13일 화요일', empty: '날짜 선택' },
  time: { filled: '오후 5:00', empty: '시간 선택' },
} as const;

type RsvDateTimeKind = keyof typeof RSV_DATE_TIME_LABEL;

interface RsvDateTimeProps extends Omit<ComponentProps<'div'>, 'children'> {
  type?: RsvDateTimeKind;
  isFilled?: boolean;
  children?: ReactNode;
}

/** V4 / Reservation / Date And Time */
function RsvDateTime({ type = 'date', isFilled = true, children, className, ...props }: RsvDateTimeProps) {
  const Icon = type === 'date' ? RsvCalendarFill : RsvClock;

  return (
    <div className={cn('inline-flex items-center gap-x1', className)} {...props}>
      <Icon className='text-primitive-orange-300 shrink-0' />
      <span className={cn('body1-bold whitespace-nowrap', isFilled ? 'text-text-primary' : 'text-text-caption')}>
        {children ?? RSV_DATE_TIME_LABEL[type][isFilled ? 'filled' : 'empty']}
      </span>
    </div>
  );
}

export { RsvDateTime };
export type { RsvDateTimeProps, RsvDateTimeKind };
