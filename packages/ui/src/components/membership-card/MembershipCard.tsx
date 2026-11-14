import { type ReactNode } from 'react';

import { ChevronRight } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { MembershipCardStatusBadge, type MembershipCardStatus } from '../membership-card-status-badge';

const MEMBERSHIP_CARD_STATE = {
  active: 'active',
  onHold: 'onHold',
  scheduled: 'scheduled',
  expired: 'expired',
  reservation: 'reservation',
  empty: 'empty',
} as const;

type MembershipCardState = keyof typeof MEMBERSHIP_CARD_STATE;

const MEMBERSHIP_BADGE_STATUS = {
  active: 'soon',
  onHold: 'onHold',
  scheduled: 'scheduled',
  expired: 'expired',
  reservation: 'soon',
} as const satisfies Record<Exclude<MembershipCardState, 'empty'>, MembershipCardStatus>;

interface MembershipCardProps {
  state?: MembershipCardState;
  title?: string;
  period?: string;
  periodLead?: string;
  count?: ReactNode;
  total?: ReactNode;
  remainingCount?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
  onReserve?: () => void;
}

const COPY = {
  active: {
    title: '왈왈컹컹 유치원 10회권',
    period: '2026.09.01 ~ 2026.10.12',
    count: '6회',
    total: '/ 10회 예약 가능',
  },
  onHold: {
    title: '왈왈컹컹 유치원 10회권',
    periodLead: '홀딩 기간',
    period: '2026.10.01 ~ 2026.10.31',
    count: '6회',
    total: '/ 10회 예약 가능',
  },
  scheduled: {
    title: '왈왈컹컹 유치원 10회권',
    period: '2026.10.01 ~ 2026.10.31',
    count: '10회',
    total: '/ 10회 예약 가능',
  },
  expired: {
    title: '왈왈컹컹 유치원 10회권',
    period: '2026.03.09 이용 기간 만료',
    count: '2회',
    total: '/ 5회 (기간 만료로 예약 불가)',
  },
  reservation: {
    title: '10회권',
    period: '2026.08.13 ~ 2026.10.13',
  },
} as const;

/** V4 / Membership Card */
function MembershipCard({
  state = 'active',
  title,
  period,
  periodLead,
  count,
  total,
  remainingCount = '2',
  badge,
  icon,
  showIcon = true,
  className,
  onClick,
  onReserve,
}: MembershipCardProps) {
  if (state === 'empty') {
    return (
      <div
        className={cn(
          'bg-fill-secondary-100 radius-r3 px-x4 py-x5 gap-x1 flex w-full flex-col items-center justify-center text-center',
          className
        )}
      >
        <p className='body1-bold text-fill-secondary-500'>사용할 수 있는 이용권이 없어요.</p>
        <p className='label-medium text-text-caption'>충전은 유치원에 문의해 주세요.</p>
      </div>
    );
  }

  if (state === 'reservation') {
    const copy = COPY.reservation;

    return (
      <div className={cn('bg-bg-0 radius-r3 py-x4 pr-x4 pl-x5 gap-x3 flex w-full items-stretch', className)}>
        <div className='gap-x2 flex min-w-0 flex-1 flex-col items-start'>
          {badge ?? <MembershipCardStatusBadge status={MEMBERSHIP_BADGE_STATUS.reservation} />}
          <div className='gap-x1 flex w-full flex-col pl-x0_5'>
            <div className='gap-x1 flex min-w-0 items-center'>
              <p className='h3-semibold text-text-primary max-w-[140px] min-w-0 truncate'>{title ?? copy.title}</p>
              <p className='body2-regular text-text-secondary shrink-0'>
                (잔여 <span className='text-text-accent'>{remainingCount}</span>회)
              </p>
            </div>
            <p className='body2-regular text-text-secondary'>{period ?? copy.period}</p>
          </div>
        </div>
        <div className='flex w-[84px] shrink-0 flex-col justify-end self-stretch'>
          <button
            type='button'
            onClick={onReserve}
            className='body2-bold text-text-primary bg-bg-50 flex h-x10 w-full items-center justify-center rounded-[10px]'
          >
            예약하기
          </button>
        </div>
      </div>
    );
  }

  const copy = COPY[state];
  const isExpired = state === 'expired';
  const isMuted = state === 'onHold' || state === 'scheduled';
  const lead = periodLead ?? ('periodLead' in copy ? copy.periodLead : undefined);
  const surfaceClass = cn(
    'radius-r3 gap-x3 py-x5 pr-x2 pl-x5 flex w-full flex-col items-start text-left',
    isExpired ? 'bg-bg-100' : 'bg-bg-0',
    className
  );
  const content = (
    <>
      <span className='gap-x1 flex w-full flex-col'>
        <span className='pr-x2 flex w-full items-center justify-between'>
          <span className='gap-x2_5 flex min-w-0 items-center'>
            <span className='h3-semibold text-text-primary max-w-[200px] min-w-0 truncate'>{title ?? copy.title}</span>
            {badge ?? <MembershipCardStatusBadge status={MEMBERSHIP_BADGE_STATUS[state]} />}
          </span>
          {showIcon ? (
            icon ?? (
              <ChevronRight className={isExpired ? 'text-fill-secondary-500 shrink-0' : 'text-text-primary shrink-0'} />
            )
          ) : null}
        </span>
        <span
          className={cn(
            'gap-x1 flex items-center',
            isExpired ? 'label-medium text-fill-secondary-500' : 'body2-regular text-text-secondary'
          )}
        >
          {lead ? <span>{lead}</span> : null}
          <span>{period ?? copy.period}</span>
        </span>
      </span>
      <span className='gap-x1 flex items-baseline'>
        <span
          className={cn(
            isExpired ? 'label-semibold text-fill-secondary-500' : 'h2-extrabold',
            !isExpired && (isMuted ? 'text-fill-secondary-500' : 'text-text-accent')
          )}
        >
          {count ?? copy.count}
        </span>
        <span className='body2-regular text-text-secondary'>{total ?? copy.total}</span>
      </span>
    </>
  );

  if (!onClick) return <div className={surfaceClass}>{content}</div>;

  return (
    <button type='button' onClick={onClick} className={surfaceClass}>
      {content}
    </button>
  );
}

export { MembershipCard, MEMBERSHIP_CARD_STATE };
export type { MembershipCardProps, MembershipCardState };
