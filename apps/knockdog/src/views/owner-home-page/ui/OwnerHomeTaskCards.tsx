import type { ReactNode } from 'react';
import Image from 'next/image';

interface OwnerHomeTaskCardsProps {
  unsentCount: number;
  expiringCount: number;
  noticebookState?: ReactNode;
  ticketsState?: ReactNode;
  onNoticebookClick: () => void;
  onNewsClick: () => void;
  onTicketsClick: () => void;
}

const OwnerHomeTaskCards = ({
  unsentCount,
  expiringCount,
  noticebookState,
  ticketsState,
  onNoticebookClick,
  onNewsClick,
  onTicketsClick,
}: OwnerHomeTaskCardsProps) => (
  <section aria-label='유치원 업무' className='gap-x2 grid grid-cols-2'>
    {noticebookState ?? (
      <button
        type='button'
        onClick={onNoticebookClick}
        className='bg-fill-primary-50 radius-r5 p-x5 relative flex min-h-[180px] min-w-0 flex-col justify-between overflow-hidden text-left'
      >
        <Image
          src='/images/owner_home_paw.svg'
          alt=''
          width={281}
          height={288}
          className='pointer-events-none absolute -top-[23px] -left-[14px] h-[287.044px] w-[280.837px] max-w-none'
        />
        <span className='h3-semibold text-text-primary relative'>알림장</span>
        <span className='text-text-accent gap-x1 relative flex flex-wrap items-baseline'>
          <span className='text-[34.5657px] leading-[36.726px] font-extrabold tracking-[-0.02em]'>{unsentCount}</span>
          <span className='text-[17.2828px] leading-[25.9243px] font-normal tracking-[-0.01em]'>건 작성 필요</span>
        </span>
      </button>
    )}
    <div className='gap-x2 flex min-w-0 flex-col'>
      <button
        type='button'
        onClick={onNewsClick}
        className='bg-bg-0 radius-r5 gap-x1 py-x2 pl-x5 pr-x2 flex min-h-[86px] flex-1 flex-col justify-center text-left'
      >
        <span className='h3-semibold text-text-primary'>소식 관리</span>
        <span className='caption1-regular text-primitive-neutral-500 leading-[18px]'>소식을 업로드 할 수 있어요</span>
      </button>
      {ticketsState ?? (
        <button
          type='button'
          onClick={onTicketsClick}
          className='bg-bg-0 radius-r5 gap-x1 py-x2 pl-x5 pr-x2 flex min-h-[86px] flex-1 flex-col justify-center text-left'
        >
          <span className='h3-semibold text-text-primary'>이용권 확인</span>
          <span className='caption1-regular text-primitive-neutral-500 leading-[18px]'>
            {expiringCount > 0 ? `만료 예정인 이용권이 ${expiringCount}건 있어요` : '만료 예정인 이용권이 없어요'}
          </span>
        </button>
      )}
    </div>
  </section>
);

export { OwnerHomeTaskCards };
export type { OwnerHomeTaskCardsProps };
