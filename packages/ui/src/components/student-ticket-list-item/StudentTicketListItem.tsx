import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { TicketStatusBadge } from '../ticket-status-badge';

type StudentSex = 'female' | 'male';

interface StudentTicketListItemProps extends ComponentProps<'div'> {
  name: ReactNode;
  guardian: ReactNode;
  /** 성별 아이콘. null이면 보여주지 않는다 */
  sex?: StudentSex | null;
  /** 원생 프로필 이미지. 없으면 발바닥 아이콘을 보여준다 */
  avatarSrc?: string | null;
  avatarAlt?: string;
  status?: ReactNode;
  ticketName?: ReactNode;
  ticketDetail?: ReactNode;
  /** `이용권명 | 잔여 정보`를 이미 하나로 만든 문구. 주면 ticketName·ticketDetail 대신 이것만 보여준다 */
  ticketSummary?: ReactNode;
  /** 줄 오른쪽에 놓는 버튼 영역 (예: 거절·승인) */
  action?: ReactNode;
}

function PawIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='20' height='17.3335' viewBox='0 0 20 17.3335' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <ellipse
        cx='2.30077'
        cy='3.06816'
        rx='2.30077'
        ry='3.06816'
        transform='matrix(0.996198 -0.0871178 0.0871937 0.996191 4.59668 0.400879)'
        fill='currentColor'
      />
      <ellipse
        cx='2.30074'
        cy='3.06821'
        rx='2.30074'
        ry='3.06821'
        transform='matrix(0.978166 -0.207824 0.207999 0.978129 0 5.11442)'
        fill='currentColor'
      />
      <ellipse
        cx='2.30074'
        cy='3.06821'
        rx='2.30074'
        ry='3.06821'
        transform='matrix(-0.978166 -0.207824 -0.207999 0.978129 20 5.11442)'
        fill='currentColor'
      />
      <path
        d='M13.3742 8.45793C12.6472 7.48904 11.8395 6.84312 9.65849 6.84312C7.5179 6.96423 6.62941 8.45793 5.9832 9.74978C5.33699 11.0416 4.48887 11.2839 3.64067 12.5353C2.97907 13.5115 2.99446 15.3209 3.64067 16.209C4.28688 17.0972 5.37735 17.2587 6.50822 17.2587C7.63909 17.2587 8.68918 16.6128 9.94121 16.6128C11.1932 16.6128 11.8798 17.0568 13.0107 17.2587C14.1416 17.4605 15.4744 17.299 16.4033 16.209C17.3322 15.119 17.0091 12.6161 15.6359 11.6068C14.2627 10.5976 14.1012 9.42682 13.3742 8.45793Z'
        fill='currentColor'
      />
      <ellipse
        cx='2.30077'
        cy='3.06816'
        rx='2.30077'
        ry='3.06816'
        transform='matrix(-0.996198 -0.0871178 -0.0871937 0.996191 15.4647 0.40088)'
        fill='currentColor'
      />
    </svg>
  );
}

function FemaleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M8 10V14.6667'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6 12.6667H10'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 6C12 8.20914 10.2091 10 8 10C5.79086 10 4 8.20914 4 6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6Z'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function MaleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M10 2H14V6' stroke='currentColor' strokeWidth='1.33333' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M14 2L9.33333 6.66667'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6.66667 14C8.50762 14 10 12.5076 10 10.6667C10 8.82572 8.50762 7.33333 6.66667 7.33333C4.82572 7.33333 3.33333 8.82572 3.33333 10.6667C3.33333 12.5076 4.82572 14 6.66667 14Z'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Card / Student Ticket List Item */
function StudentTicketListItem({
  name,
  guardian,
  sex = 'female',
  avatarSrc,
  avatarAlt = '',
  status = '1회 남음',
  ticketName,
  ticketDetail,
  ticketSummary,
  action,
  className,
  ...props
}: StudentTicketListItemProps) {
  return (
    <div
      className={cn('border-line-100 bg-bg-0 gap-x3 p-x4 flex w-full items-start border-b border-solid', className)}
      {...props}
    >
      <Avatar className='border-line-100 bg-bg-50 size-11 shrink-0 border-2'>
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={avatarAlt} className='object-cover' /> : null}
        <AvatarFallback className='bg-bg-50'>
          <PawIcon className='text-fill-secondary-300' />
        </AvatarFallback>
      </Avatar>
      <span className='gap-x2 flex min-w-0 flex-1 flex-col'>
        <span className='gap-x2 flex flex-col'>
          <span className='gap-x2 flex items-center'>
            <span className='gap-x1 flex items-center'>
              <span className='h3-semibold text-text-primary'>{name}</span>
              {sex === 'female' ? <FemaleIcon className='text-text-secondary-inverse' /> : null}
              {sex === 'male' ? <MaleIcon className='text-text-secondary-inverse' /> : null}
            </span>
            {status ? <TicketStatusBadge>{status}</TicketStatusBadge> : null}
          </span>
          <span className='body2-regular text-fill-secondary-500'>{guardian}</span>
        </span>
        {ticketSummary ? (
          <span className='bg-bg-100 radius-r3 px-x3 flex h-[38px] w-full items-center'>
            <span className='caption1-semibold text-fill-secondary-500'>{ticketSummary}</span>
          </span>
        ) : ticketName ? (
          <span className='bg-bg-100 radius-r3 gap-x1 px-x3 flex h-[38px] w-full items-center'>
            <span className='caption1-semibold text-fill-secondary-500'>{ticketName}</span>
            <span className='caption1-regular text-fill-secondary-500'>|</span>
            {ticketDetail ? <span className='caption1-regular text-fill-secondary-500'>{ticketDetail}</span> : null}
          </span>
        ) : null}
      </span>
      {action ? <div className='flex shrink-0 items-center self-center'>{action}</div> : null}
    </div>
  );
}

export { StudentTicketListItem };
export type { StudentSex, StudentTicketListItemProps };
