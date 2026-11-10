'use client';

import Image from 'next/image';

import { Divider, Icon } from '@knockdog/ui';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function ManagementMenuButton({
  iconSrc,
  title,
  description,
  onClick,
}: {
  iconSrc: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button type='button' className='flex w-full items-center gap-3 py-2 pr-1 pl-2 text-left' onClick={onClick}>
      <span className='bg-fill-primary-50 flex h-[46px] w-[45px] shrink-0 items-center justify-center rounded-lg'>
        <Image src={iconSrc} alt='' width={24} height={24} unoptimized />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='body1-medium text-text-primary block'>{title}</span>
        <span className='caption1-regular text-text-tertiary mt-1 block'>{description}</span>
      </span>
      <Icon icon='ChevronRight' className='text-text-tertiary size-4 shrink-0' />
    </button>
  );
}

/** 원장 마이페이지의 유치원 관리 메뉴. 이용권 관리와 예약 설정으로 이동한다. */
function OwnerPassTemplateManagementSection() {
  const { push } = useStackNavigation();

  return (
    <section className='bg-bg-0 px-4 pt-4 pb-7'>
      <h2 className='label-medium text-text-secondary px-1 pb-4'>유치원 관리</h2>
      <div className='flex flex-col gap-3'>
        <ManagementMenuButton
          iconSrc='/images/img_mypage_ticket.svg'
          title='이용권 관리'
          description='자주 사용하는 이용권을 관리 할 수 있어요.'
          onClick={() => push({ pathname: route.mypage.passTemplate.root })}
        />
        <Divider className='border-line-100' />
        <ManagementMenuButton
          iconSrc='/images/img_mypage_reservation.svg'
          title='예약 설정'
          description='등원 가능 시간 및 정원을 설정할 수 있어요.'
          onClick={() => push({ pathname: route.mypage.kindergarten.reservation.root })}
        />
      </div>
    </section>
  );
}

export { OwnerPassTemplateManagementSection };
