import { type ReactNode } from 'react';

import { CheckFill, ChevronRight, Close } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { SelectDogCard } from '../select-dog-card';

interface RsvConfirmedSheetProps {
  dogName?: string;
  breed?: string;
  age?: string;
  weight?: string;
  dogImage?: ReactNode;
  kindergarten?: string;
  date?: string;
  time?: string;
  ticket?: string;
  remaining?: string;
  className?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  onMyReservations?: () => void;
}

function InfoRow({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div className={cn('px-x3 flex items-start justify-between', extra ? 'pt-x3 pb-x1' : 'p-x3')}>
      <p className='body2-regular text-text-secondary'>{label}</p>
      <div className='gap-x0_5 flex flex-col items-end text-right'>
        <p className='body1-bold text-text-primary'>{value}</p>
        {extra ? <p className='label-medium text-text-accent'>{extra}</p> : null}
      </div>
    </div>
  );
}

/** V4 / Bottom Sheet / Reservation Confirmed */
function RsvConfirmedSheet({
  dogName = '찹츄',
  breed = '골든리트리버',
  age = '3살',
  weight = '20kg',
  dogImage,
  kindergarten = '왈왈컹컹 유치원',
  date = '10월 8일 (수)',
  time = '오후 5:00',
  ticket = '10회권 1회 사용',
  remaining = '잔여 5회',
  className,
  onClose,
  onConfirm,
  onMyReservations,
}: RsvConfirmedSheetProps) {
  return (
    <div
      className={cn(
        'bg-bg-0 flex max-h-[calc(100dvh-72px)] w-full flex-col overflow-hidden rounded-t-[24px] shadow-[0_-16px_10px_rgba(0,0,0,0.05)]',
        className
      )}
    >
      <div className='flex h-x8 w-full shrink-0 justify-center pt-x3'>
        <span className='bg-fill-secondary-400 h-x1 w-x9 rounded-full' />
      </div>
      <div className='py-x3_5 pr-x5 pl-x6 flex shrink-0 justify-end'>
        <button type='button' aria-label='닫기' onClick={onClose} className='inline-flex'>
          <Close className='text-text-primary' />
        </button>
      </div>
      <div className='px-x4 pb-x4 gap-x6 flex min-h-0 flex-col overflow-y-auto'>
        <div className='gap-x2 flex flex-col items-center px-x0_5'>
          <CheckFill className='text-fill-primary-500 size-x12' />
          <p className='h1-extrabold text-text-primary text-center'>예약이 확정되었어요</p>
          <div className='gap-x0_5 flex flex-col items-center'>
            <p className='body1-medium text-text-primary'>예약 내역은 내 예약에서 확인할 수 있어요.</p>
            <button type='button' onClick={onMyReservations} className='px-x2 py-x1 gap-x1 radius-r1 inline-flex items-center'>
              <span className='label-semibold text-fill-secondary-500'>내 예약</span>
              <ChevronRight className='text-fill-secondary-500 size-x4' />
            </button>
          </div>
        </div>
        <div className='border-line-200 radius-r3 px-x4 py-x3 flex w-full flex-col border border-solid'>
          <div className='px-x3 pb-x3'>
            <SelectDogCard
              variant='list'
              name={dogName}
              breed={breed}
              age={age}
              weight={weight}
              showIcon={false}
              className='border-line-200 border-b border-solid px-0'
            >
              {dogImage}
            </SelectDogCard>
          </div>
          <InfoRow label='유치원 명' value={kindergarten} />
          <InfoRow label='날짜' value={date} />
          <InfoRow label='시간' value={time} />
          <InfoRow label='이용권' value={ticket} extra={remaining} />
        </div>
      </div>
      <div className='px-x4 pt-x4 pb-x8 webview:pb-[calc(var(--safe-area-inset-bottom,0px)+32px)] shrink-0'>
        <button
          type='button'
          onClick={onConfirm}
          className='body1-bold bg-fill-primary-500 text-text-primary-inverse radius-r3 h-x14 w-full'
        >
          확인
        </button>
      </div>
    </div>
  );
}

export { RsvConfirmedSheet };
export type { RsvConfirmedSheetProps };
