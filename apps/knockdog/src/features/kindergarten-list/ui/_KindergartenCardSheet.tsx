/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { ActionButton, Icon } from '@knockdog/ui';

import { PhoneCallSheet } from './PhoneCallSheet';
import { DeparturePointSheet, ServiceBadgesTruncated, type KindergartenListItemWithMeta } from '@entities/kindergarten';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useCompareStore } from '@shared/store/useCompareStore';

type Props = KindergartenListItemWithMeta & {
  isOpen: boolean;
  close: () => void;
};

const snapPoints = ['328px', 1];

export function KindergartenCardSheet({ isOpen, close, ...props }: Props) {
  const router = useRouter();
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0] ?? null);
  // const { push } = useStackNavigation();

  const { items, isSelected, toggle, remove, clear } = useCompareStore();
  const selected = isSelected(props.id);
  const count = items.length;

  const priceText = useMemo(() => `${props.price.toLocaleString()}~`, [props.price]);
  const canCompare = count === 2;
  const showComparePanel = count >= 2;

  // ✅ 카테고리 텍스트(서브텍스트) 생성
  const ctgText = useMemo(
    () =>
      props.ctg
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .join(' ・ ') || '유치원 ・ 호텔',
    [props.ctg]
  );

  const query = useMemo(() => items.map((v) => `ids=${encodeURIComponent(v.id)}`).join('&'), [items]);

  const handleCompare = () => {
    if (!canCompare) return;
    const url = `/compare-complete?${query}`;
    clear();
    close();
    router.push(url);
  };

  const openPhoneCallActionSheet = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet isOpen={isOpen} close={close} phoneNumber={props.phoneNumber} />
    ));
  };

  const openDeparturePointSheet = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    overlay.open(({ isOpen, close }) => (
      <DeparturePointSheet
        isOpen={isOpen}
        close={close}
        to={{ lat: props.coord.lat, lng: props.coord.lng, name: props.title }}
      />
    ));
  };

  /** ===================== 상세 뷰 ===================== */
  const renderDetailContent = () => (
    <>
      <div className='pt-x3_5 gap-x3 px-x4 flex w-full flex-col'>
        <div className='gap-x2 flex'>
          {/* 썸네일 */}
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${props.banner?.[0]}`}
            className='radius-r2 size-[90px] object-cover'
            alt=''
          />

          {/* 타이틀/카테고리 */}
          <div className='gap-x2 flex flex-1 flex-col'>
            <div className='flex items-start justify-between'>
              <div className='gap-x0_5 flex flex-col'>
                <p className='h2-extrabold text-text-primary'>{props.title}</p>
                <span className='label-medium text-text-tertiary'>{ctgText}</span>
              </div>

              {/* 길찾기 */}
              <button onClick={openDeparturePointSheet} aria-label='길찾기'>
                <Icon icon='Navigation' className='size-x8 text-fill-secondary-500' />
              </button>
            </div>

            {/* 리뷰/메모 */}
            <div className='flex shrink-0 items-center gap-[2px]'>
              <div className='radius-r2 bg-fill-secondary-50 px-x2 py-x1 flex items-center'>
                <Icon icon='Naver' className='size-x4' />
                <span className='caption1-semibold text-text-primary text-center'>리뷰 {props.reviewCount}개</span>
              </div>
              <div className='radius-r2 bg-fill-secondary-50 ml-x1 px-x2 py-x1 flex items-center'>
                <Icon icon='Note' className='size-x4' />
                <span className='caption1-semibold text-text-primary'>2025.04.16</span>
                <span className='caption1-semibold text-text-primary'>메모</span>
              </div>
            </div>
          </div>
        </div>

        {/* 영업/주소 */}
        <div className='self-stretch'>
          <div className='grid grid-cols-[minmax(52px,max-content)_1fr] grid-rows-2 gap-x-2 gap-y-2'>
            <span className='body2-extrabold text-text-accent col-start-1 row-start-1 overflow-hidden text-ellipsis whitespace-nowrap'>
              {props.operationStatus === 'OPEN' ? '영업중' : '영업종료'}
            </span>
            <span className='body2-regular text-text-primary col-start-2 row-start-1 overflow-hidden text-ellipsis'>
              {props.operationStatus === 'OPEN'
                ? `${props.operationTimes.endTime}에 영업종료`
                : `${props.operationTimes.startTime}에 영업시작`}
            </span>
            <span className='body2-extrabold text-text-primary col-start-1 row-start-2 overflow-hidden text-ellipsis whitespace-nowrap'>
              {typeof props.dist === 'number'
                ? `${Number(props.dist).toFixed(2)}km`
                : typeof props.dist === 'string'
                  ? props.dist
                  : ''}
            </span>
            <span className='body2-regular text-text-primary col-start-2 row-start-2 overflow-hidden text-ellipsis'>
              {props.roadAddress}
            </span>
          </div>
        </div>

        <div className='bg-line-100 h-[1px] w-full' />

        {/* 배지/가격 */}
        <div className='flex min-w-0 items-center justify-between self-stretch'>
          <ServiceBadgesTruncated serviceTags={props.serviceTags} pickupType={props.pickupType} />
          <div className='gap-x1 flex shrink-0 items-center'>
            <span className='body2-regular text-text-primary'>이용요금</span>
            <span className='h3-extrabold text-text-primary'>{priceText}</span>
          </div>
        </div>
      </div>

      {/* 상세 하단 버튼 + 토글 유지 */}
      <BottomSheet.Footer className='pt-x6 pb-x4'>
        <div className='gap-x2 flex items-center'>
          <ActionButton variant='primaryLine' size='medium' onClick={openPhoneCallActionSheet}>
            전화하기
          </ActionButton>

          {/* ✅ 스토어에 ctgText까지 저장 */}
          <ActionButton
            variant='primaryFill'
            size='medium'
            onClick={() =>
              toggle({
                id: props.id,
                title: props.title,
                thumb: props.banner?.[0],
                ctgText,
              })
            }
          >
            {selected ? '− 선택 해제' : '+ 선택하기'}
          </ActionButton>

          <button
            className='radius-r3 bg-fill-primary-50 flex size-[44px] shrink-0 items-center justify-center'
            aria-label='북마크'
          >
            <Icon icon='BookmarkLine' className='size-x6 text-fill-primary-500' />
          </button>
        </div>
      </BottomSheet.Footer>
    </>
  );

  /** ===================== 비교 패널(2개 선택) ===================== */
  const renderComparePanel = () => (
    <>
      <div className='px-x4 pt-x3 w-full'>
        <div className='mb-x3 gap-x3 grid grid-cols-2'>
          {items.slice(0, 2).map((v) => (
            <div key={v.id} className='border-line-100 bg-fill-secondary-0 overflow-hidden rounded-xl border'>
              {/* ✅ 이미지 컨테이너를 relative로 두고, 내부 이미지는 absolute로 꽉 채움 */}
              <div className='bg-fill-secondary-50 relative aspect-[5/3] w-full'>
                {v.thumb && <img src={v.thumb} alt='' className='absolute inset-0 h-full w-full object-cover' />}
                {/* ✅ X 버튼을 우상단에 고정 (tailwind 기본 클래스도 병행) */}
                <button
                  className='absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white'
                  onClick={() => remove(v.id)}
                  aria-label='선택 해제'
                >
                  ×
                </button>
              </div>

              {/* ✅ 타이틀 + 서브텍스트 노출 */}
              <div className='px-x3 py-x2'>
                <div className='h4-extrabold text-text-primary truncate'>{v.title}</div>
                <div className='body2-regular mt-x1 text-text-tertiary'>{v.ctgText ?? '유치원 ・ 호텔'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomSheet.Footer className='px-x4 pt-x2 pb-x4'>
        <div className='gap-x2 flex w-full items-center justify-between'>
          <ActionButton
            size='medium'
            variant='secondaryLine'
            onClick={() => {
              clear();
            }}
          >
            닫기
          </ActionButton>

          <ActionButton size='medium' variant='primaryFill' disabled={!canCompare} onClick={handleCompare}>
            비교하기 {count}/2
          </ActionButton>
        </div>
      </BottomSheet.Footer>
    </>
  );

  return (
    <BottomSheet.Root
      open={isOpen}
      onOpenChange={close}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <BottomSheet.Body className='bottom-[68px] z-50 h-full'>
        <BottomSheet.Handle />
        <BottomSheet.Title className='sr-only'>강아지 유치원 상세 정보</BottomSheet.Title>

        {/* 2개 선택되면 비교 패널, 아니면 상세 */}
        {showComparePanel ? renderComparePanel() : renderDetailContent()}
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}
