'use client';

import { Fragment, useId, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface HomeLatePet {
  id: string;
  name: string;
  profileImageUrl?: string;
}

interface OwnerHomeStatusCardProps {
  dateLabel: string;
  currentlyInCount: number;
  checkedInCount: number;
  absentCount: number;
  checkedOutCount: number;
  lateCount: number;
  latePets: HomeLatePet[];
  onLatePetsClick: () => void;
}

const OwnerHomeStatusCard = ({
  dateLabel,
  currentlyInCount,
  checkedInCount,
  absentCount,
  checkedOutCount,
  lateCount,
  latePets,
  onLatePetsClick,
}: OwnerHomeStatusCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  return (
    <section aria-label='오늘 유치원 현황' className='bg-bg-0 radius-r5 gap-x5 p-x4 py-x5 flex flex-col'>
      <div className='gap-x2 px-x1 flex flex-col'>
        <p className='label-medium text-primitive-neutral-500'>{dateLabel}</p>
        <h2 className='h1-extrabold text-text-primary'>
          지금 유치원에
          <br />
          <span className='text-text-accent'>{currentlyInCount}</span> 마리 강아지가 놀고 있어요!
        </h2>
      </div>

      {lateCount > 0 ? (
        <div className='bg-fill-primary-50 overflow-hidden rounded-[24px]'>
          <button
            type='button'
            aria-expanded={isExpanded}
            aria-controls={contentId}
            className='gap-x2 px-x6 py-x4 flex w-full items-center justify-between text-left'
            onClick={() => setIsExpanded((value) => !value)}
          >
            <span className='body1-medium text-text-primary'>등원 시간이 지난 강아지</span>
            <span className='bg-primitive-orange-100 text-text-accent radius-r4 gap-x1 py-x2 pl-x3 pr-x2 flex shrink-0 items-center'>
              <span className='caption1-semibold leading-[18px]'>{lateCount} 마리</span>
              <Icon icon={isExpanded ? 'ChevronTop' : 'ChevronBottom'} className='text-primitive-orange-300 size-x4' />
            </span>
          </button>
          <div id={contentId} hidden={!isExpanded}>
            <button
              type='button'
              aria-label='지각 원생 등원처리로 이동'
              className='gap-x4 px-x6 pb-x6 pt-x1_5 flex w-full flex-col text-left'
              onClick={onLatePetsClick}
            >
              {latePets.map((pet) => (
                <span key={pet.id} className='gap-x2 flex w-full items-center'>
                  <Avatar className='bg-primitive-orange-100 size-x9! shrink-0'>
                    <AvatarImage
                      src={pet.profileImageUrl ? resolvePublicImageSrc(pet.profileImageUrl) : undefined}
                      alt={`${pet.name} 프로필`}
                      className='object-cover'
                    />
                    <AvatarFallback className='bg-primitive-orange-100' />
                  </Avatar>
                  <span className='body1-medium text-text-primary'>{pet.name}</span>
                </span>
              ))}
            </button>
          </div>
        </div>
      ) : null}

      <dl className='gap-x2 py-x3 flex items-center'>
        {[
          { label: '등원 완료', count: checkedInCount },
          { label: '결석 확정', count: absentCount },
          { label: '하원 완료', count: checkedOutCount },
        ].map(({ label, count }, index) => (
          <Fragment key={label}>
            <div className='flex min-w-0 flex-1 flex-col items-center'>
              <dd className='h1-extrabold text-text-primary'>{count}</dd>
              <dt className='body2-regular text-primitive-neutral-500'>{label}</dt>
            </div>
            {index < 2 ? <div aria-hidden className='bg-line-100 h-x10 w-px shrink-0' /> : null}
          </Fragment>
        ))}
      </dl>
    </section>
  );
};

export { OwnerHomeStatusCard };
export type { OwnerHomeStatusCardProps, HomeLatePet };
