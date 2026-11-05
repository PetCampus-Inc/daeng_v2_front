import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const MANAGEMENT_MENU = {
  ticket: {
    title: '이용권 관리',
    description: '자주 사용하는 이용권을 관리 할 수 있어요.',
  },
  reservation: {
    title: '예약 설정',
    description: '등원 가능 시간 및 정원을 설정할 수 있어요.',
  },
} as const;

type ManagementMenu = keyof typeof MANAGEMENT_MENU;

interface ManagementMenuCellProps extends Omit<ComponentProps<'button'>, 'children' | 'title'> {
  menu?: ManagementMenu;
  title?: ReactNode;
  description?: ReactNode;
}

function TicketIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M2 9C2.79565 9 3.55871 9.31607 4.12132 9.87868C4.68393 10.4413 5 11.2044 5 12C5 12.7956 4.68393 13.5587 4.12132 14.1213C3.55871 14.6839 2.79565 15 2 15V17C2 17.5304 2.21071 18.0391 2.58579 18.4142C2.96086 18.7893 3.46957 19 4 19H20C20.5304 19 21.0391 18.7893 21.4142 18.4142C21.7893 18.0391 22 17.5304 22 17V15C21.2044 15 20.4413 14.6839 19.8787 14.1213C19.3161 13.5587 19 12.7956 19 12C19 11.2044 19.3161 10.4413 19.8787 9.87868C20.4413 9.31607 21.2044 9 22 9V7C22 6.46957 21.7893 5.96086 21.4142 5.58579C21.0391 5.21071 20.5304 5 20 5H4C3.46957 5 2.96086 5.21071 2.58579 5.58579C2.21071 5.96086 2 6.46957 2 7V9Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M13 5V7' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M13 17V19' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M13 11V13' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function ReservationIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M14 21V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V21'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M18 4.933V21' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M4 6L11.106 2.21C11.3836 2.07128 11.6897 1.99907 12 1.99907C12.3103 1.99907 12.6164 2.07128 12.894 2.21L20 6'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6 11L2.48 13.147C2.33345 13.2362 2.21232 13.3616 2.12826 13.5112C2.0442 13.6608 2.00003 13.8294 2 14.001V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V14C21.9998 13.8286 21.9555 13.6601 21.8715 13.5108C21.7874 13.3614 21.6664 13.2361 21.52 13.147L18 11'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M6 4.933V21' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function ChevronDown(props: ComponentProps<'svg'>) {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M4 6L8 10L12 6'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Navigation / Management Menu Cell */
function ManagementMenuCell({
  menu = 'ticket',
  title,
  description,
  className,
  type = 'button',
  ...props
}: ManagementMenuCellProps) {
  const content = MANAGEMENT_MENU[menu];

  return (
    <button
      type={type}
      className={cn('bg-bg-0 flex w-full items-center gap-x2 py-x2 pr-x1 pl-x2', className)}
      {...props}
    >
      <span className='flex min-w-0 flex-1 items-center justify-between'>
        <span className='flex min-w-0 items-center gap-x3'>
          <span className='bg-fill-primary-50 radius-r2 flex h-[46px] w-[45px] shrink-0 items-center justify-center'>
            {menu === 'reservation' ? (
              <ReservationIcon className='text-primitive-orange-300' />
            ) : (
              <TicketIcon className='text-primitive-orange-300' />
            )}
          </span>
          <span className='flex min-w-0 flex-col items-start gap-x1'>
            <span className='body1-medium text-text-primary'>{title ?? content.title}</span>
            <span className='caption1-regular text-fill-secondary-500 whitespace-nowrap'>{description ?? content.description}</span>
          </span>
        </span>
        <span className='-rotate-90 shrink-0'>
          <ChevronDown className='text-text-secondary-inverse' />
        </span>
      </span>
    </button>
  );
}

export { ManagementMenuCell };
export type { ManagementMenu, ManagementMenuCellProps };
