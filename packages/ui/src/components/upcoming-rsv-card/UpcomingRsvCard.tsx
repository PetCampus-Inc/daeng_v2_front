import { type ReactNode, type SVGProps } from 'react';

import { ChevronRight } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const UPCOMING_RSV_STATUS = {
  active: 'active',
  empty: 'empty',
} as const;

type UpcomingRsvStatus = keyof typeof UPCOMING_RSV_STATUS;

interface UpcomingRsvCardProps {
  status?: UpcomingRsvStatus;
  title?: ReactNode;
  place?: ReactNode;
  className?: string;
  onClick?: () => void;
}

function ScheduleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='30' height='30' viewBox='0 0 30 30' fill='none' aria-hidden {...props}>
      <path
        d='M20 5V7.5M20 7.5H23.75C24.0815 7.5 24.3995 7.6317 24.6339 7.86612C24.8683 8.10054 25 8.41848 25 8.75V23.75C25 24.0815 24.8683 24.3995 24.6339 24.6339C24.3995 24.8683 24.0815 25 23.75 25H6.25C5.91848 25 5.60054 24.8683 5.36612 24.6339C5.1317 24.3995 5 24.0815 5 23.75V8.75C5 8.41848 5.1317 8.10054 5.36612 7.86612C5.60054 7.6317 5.91848 7.5 6.25 7.5H10M20 7.5H10M10 5V7.5M10.575 16.1425L13.2263 18.795L19.4137 12.6075'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Upcoming Reservation Card */
function UpcomingRsvCard({
  status = 'active',
  title = '10월 7일 (화) 오후 02:00',
  place = '왈왈컹컹 유치원',
  className,
  onClick,
}: UpcomingRsvCardProps) {
  if (status === 'empty') {
    return (
      <div
        className={cn(
          'bg-fill-secondary-100 radius-r3 px-x4 py-x5 gap-x1 flex w-full flex-col items-center justify-center text-center',
          className
        )}
      >
        <p className='body1-bold text-fill-secondary-500'>아직 예정된 등원 일정이 없어요.</p>
        <p className='label-medium text-text-caption'>원하는 날짜로 새로 예약해 보세요.</p>
      </div>
    );
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'radius-r3 p-x4 flex w-full items-center justify-between bg-[linear-gradient(-87deg,var(--color-primitive-orange-400)_12%,var(--color-primitive-orange-500)_93%)] text-left',
        className
      )}
    >
      <span className='gap-x3 flex min-w-0 flex-1 items-center'>
        <ScheduleIcon className='text-text-primary-inverse shrink-0' />
        <span className='gap-x1 flex min-w-0 flex-col'>
          <span className='h3-extrabold text-text-primary-inverse'>{title}</span>
          <span className='body2-medium text-text-primary-inverse'>{place}</span>
        </span>
      </span>
      <ChevronRight className='text-text-primary-inverse shrink-0' />
    </button>
  );
}

export { UpcomingRsvCard, UPCOMING_RSV_STATUS };
export type { UpcomingRsvCardProps, UpcomingRsvStatus };
