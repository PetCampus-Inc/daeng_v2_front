'use client';

import { Icon } from '@knockdog/ui';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function ManagementMenuButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: 'Ticket' | 'Calendar';
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      className='radius-r3 border-line-200 flex w-full items-center gap-3 border px-4 py-4 text-left'
      onClick={onClick}
    >
      <span className='bg-fill-secondary-50 flex size-11 shrink-0 items-center justify-center rounded-full'>
        <Icon icon={icon} className='text-fill-secondary-700 size-6' />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='body1-bold text-text-primary block'>{title}</span>
        <span className='body2-regular text-text-tertiary block truncate'>{description}</span>
      </span>
      <Icon icon='ChevronRight' className='text-text-tertiary size-5 shrink-0' />
    </button>
  );
}

/** 원장 마이페이지의 유치원 관리 메뉴. 이용권 관리와 예약 설정으로 이동한다. */
function OwnerPassTemplateManagementSection() {
  const { push } = useStackNavigation();

  return (
    <section className='bg-bg-0 px-4 py-5'>
      <h2 className='h3-extrabold text-text-primary pb-3'>유치원 관리</h2>
      <div className='flex flex-col gap-2'>
        <ManagementMenuButton
          icon='Ticket'
          title='이용권 관리'
          description='자주 사용하는 이용권을 관리 할 수 있어요.'
          onClick={() => push({ pathname: route.mypage.passTemplate.root })}
        />
        <ManagementMenuButton
          icon='Calendar'
          title='예약 설정'
          description='등원 가능 시간 및 정원을 설정할 수 있어요.'
          onClick={() => push({ pathname: route.mypage.kindergarten.reservation.root })}
        />
      </div>
    </section>
  );
}

export { OwnerPassTemplateManagementSection };
