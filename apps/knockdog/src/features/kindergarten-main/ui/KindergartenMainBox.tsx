import React from 'react';
import { overlay } from 'overlay-kit';
import { Icon, Divider } from '@knockdog/ui';
import { ServiceBadgeList } from '@entities/kindergarten';
import { DeparturePointSheet } from '@features/kindergarten';
import { OPEN_STATUS_MAP, CTAG_MAP, type Kindergarten } from '@entities/kindergarten';

interface KindergartenMainBoxProps extends Omit<Kindergarten, 'banner'> {}

const KindergartenMainBox = ({
  title,
  ctg,
  dist,
  roadAddress,
  operationStatus,
  operationDescription,
  price,
  serviceTags,
  reviewCount,
  pickupType,
  memoDate,
  coords,
}: KindergartenMainBoxProps) => {
  const openDeparturePointSheet = () =>
    overlay.open(({ isOpen, close }) => (
      <DeparturePointSheet isOpen={isOpen} close={close} to={{ lat: coords.lat, lng: coords.lng, name: title }} />
    ));

  return (
    <div className='relative z-10 -mt-8 flex flex-col gap-[16px] rounded-t-[20px] bg-white px-4 pt-[20px] pb-12'>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <span className='h2-extrabold'>{title}</span>
          <span className='body2-semibold text-text-tertiary'>
            {ctg
              .split(',')
              .map((tag) => CTAG_MAP[tag.trim() as keyof typeof CTAG_MAP])
              .filter(Boolean)
              .join(' ・ ')}
          </span>
        </div>
        <div className='flex'>
          {/* 길찾기 버튼 */}
          <button onClick={openDeparturePointSheet}>
            <Icon icon='Navigation' className='text-fill-secondary-500 size-x8' />
          </button>
        </div>
      </div>
      <div className='flex flex-col gap-[4px]'>
        <div>
          <span className='body2-extrabold mr-1 inline-block min-w-[52px]'>{dist.toFixed(2)}km</span>
          <span className='body2-regular'>{roadAddress}</span>
        </div>
        <div>
          <span className='body2-extrabold text-text-accent mr-1 inline-block min-w-[52px]'>
            {OPEN_STATUS_MAP[operationStatus]}
          </span>
          <span className='body2-regular'>{operationDescription}</span>
        </div>
      </div>
      {/* 뱃지 및 가격영역 */}
      <div className='flex justify-between'>
        <div className='flex gap-1'>
          <div className='text-size-caption1 flex gap-[2px] rounded-md bg-gray-100 px-2 py-1'>
            <Icon icon='Naver' className='h-[16px] w-[16px]' />
            리뷰 {reviewCount}개
          </div>
          {memoDate && (
            <div className='text-size-caption1 flex gap-[2px] rounded-md bg-gray-100 px-2 py-1'>
              <Icon icon='Note' className='h-[16px] w-[16px]' />
              {memoDate} 노트
            </div>
          )}
        </div>
        <span className='h3-extrabold'>{price.toLocaleString()}원~</span>
      </div>
      {/* Divider */}
      <Divider />
      {/* 뱃지 리스트 */}
      <ServiceBadgeList serviceTags={serviceTags} pickupType={pickupType} />
    </div>
  );
};

export { KindergartenMainBox };
