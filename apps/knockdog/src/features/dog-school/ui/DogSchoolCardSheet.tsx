/* eslint-disable @next/next/no-img-element */

import { overlay } from 'overlay-kit';
import { ActionButton, BottomSheet, Icon } from '@knockdog/ui';
import { ServiceBadgeGroup } from './ServiceBadgeGroup';
import { PhoneCallSheet } from './PhoneCallSheet';
import { DeparturePointSheet } from './DeparturePointSheet';
import type { DogSchoolWithMeta } from '../model/mappers';

interface DogSchoolCardSheetProps extends DogSchoolWithMeta {
  isOpen: boolean;
  onChangeOpen: (isOpen: boolean) => void;
}

export function DogSchoolCardSheet({ isOpen, onChangeOpen, ...props }: DogSchoolCardSheetProps) {
  const openPhoneCallActionSheet = () =>
    overlay.open(({ isOpen, close }) => <PhoneCallSheet isOpen={isOpen} close={close} />);

  const openDeparturePointSheet = () =>
    overlay.open(({ isOpen, close }) => <DeparturePointSheet isOpen={isOpen} close={close} />);
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onChangeOpen}>
      <BottomSheet.Body className='bottom-[68px] z-50'>
        <BottomSheet.Handle />
        <BottomSheet.Title className='sr-only'>강아지 유치원 상세 정보</BottomSheet.Title>

        {/* 컨텐츠 영역 */}
        <div className='pt-x3_5 gap-x3 px-x4 flex w-full flex-col'>
          <div className='gap-x2 flex'>
            {/* 이미지 */}
            <img src={props.images?.[0]} className='radius-r2 size-[90px] object-cover' />

            {/* 타이틀 및 카테고리 */}
            <div className='gap-x2 flex flex-1 flex-col'>
              <div className='flex items-start justify-between'>
                <div className='gap-x0_5 flex flex-col'>
                  <p className='h2-extrabold text-text-primary'>{props.title}</p>
                  <span className='label-medium text-text-tertiary'>
                    {props.ctg
                      .split(',')
                      .map((tag) => tag.trim())
                      .join(' ・ ')}
                  </span>
                </div>
                {/* 길찾기 버튼 */}
                <button onClick={openDeparturePointSheet}>
                  <Icon icon='Navigation' className='text-fill-secondary-500 size-x8' />
                </button>
              </div>

              {/* 리뷰 및 메모 영역 */}
              <div className='gap-x1 flex'>
                <div className='px-x2 py-x1 radius-r2 bg-fill-secondary-50 flex shrink-0 items-center gap-[2px]'>
                  <Icon icon='Naver' className='size-x4' />
                  <span className='caption1-semibold text-text-primary text-center'>리뷰 {props.reviewCount}개</span>
                </div>
                <div className='px-x2 py-x1 radius-r2 bg-fill-secondary-50 flex shrink-0 items-center gap-[2px]'>
                  <Icon icon='Note' className='size-x4' />
                  <span className='caption1-semibold text-text-primary'>2025.04.16</span>
                  <span className='caption1-semibold text-text-primary'>메모</span>
                </div>
              </div>
            </div>
          </div>

          {/* 영업 정보 및 주소 영역 */}
          <div className='flex flex-col gap-y-1 self-stretch'>
            <div className='grid grid-cols-[minmax(52px,max-content)_1fr] grid-rows-2 gap-x-2 gap-y-2 self-stretch'>
              <span className='body2-extrabold text-text-accent col-start-1 row-start-1 overflow-hidden text-ellipsis whitespace-nowrap'>
                {props.operationStatus === 'OPEN' ? '영업중' : '영업종료'}
              </span>
              <span className='body2-regular text-text-primary col-start-2 row-start-1 overflow-hidden text-ellipsis'>
                {props.operationStatus === 'OPEN'
                  ? `${props.operationTimes.endTime}에 영업종료`
                  : `${props.operationTimes.startTime}에 영업시작`}
              </span>
              <span className='body2-extrabold text-text-primary col-start-1 row-start-2 overflow-hidden text-ellipsis whitespace-nowrap'>
                {props.dist.toFixed(2)}km
              </span>
              <span className='body2-regular text-text-primary col-start-2 row-start-2 overflow-hidden text-ellipsis'>
                {props.roadAddress}
              </span>
            </div>
          </div>

          {/* 구분선 */}
          <div className='bg-line-100 flex h-[1px] w-full items-center justify-center' />

          {/* 하단 필터 + 가격 영역 */}
          <div className='gap-x2 flex min-w-0 items-center justify-between self-stretch'>
            {/* badge 영역 */}
            <ServiceBadgeGroup serviceTags={props.serviceTags} pickupType={props.pickupType} />

            {/* 가격 영역 */}
            <div className='gap-x1 flex shrink-0 items-center'>
              <span className='body2-regular text-text-primary'>이용요금</span>
              <span className='h3-extrabold text-text-primary'>{props.price.toLocaleString()}~</span>
            </div>
          </div>
        </div>

        <BottomSheet.Footer className='pt-x6 pb-x4'>
          <div className='gap-x2 flex items-center'>
            <ActionButton variant='primaryLine' size='medium' onClick={openPhoneCallActionSheet}>
              전화하기
            </ActionButton>
            <ActionButton variant='primaryFill' size='medium'>
              비교하기
            </ActionButton>
            <button className='radius-r3 bg-fill-primary-50 flex size-[44px] shrink-0 items-center justify-center'>
              <Icon icon='BookmarkLine' className='size-x6 text-fill-primary-500' />
            </button>
          </div>
        </BottomSheet.Footer>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}
