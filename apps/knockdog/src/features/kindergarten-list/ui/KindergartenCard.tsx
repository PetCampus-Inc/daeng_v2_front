import { ActionButton, Icon } from '@knockdog/ui';
import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { useKindergartenTab } from '@widgets/kindergarten-tabs/model';
import {
  DeparturePointSheet,
  SERVICE_TAGS,
  ServiceBadgesTruncated,
  type KindergartenMain,
} from '@entities/kindergarten';
import type { BottomSheetSnapPoint } from './KindergartenItemSheet';

interface KindergartenCardProps extends KindergartenMain {
  onBookmarkClick: (id: string, bookmarked: boolean) => void;
  onPhoneCall: () => void;
  setActiveSnapPoint: (snapPoint: BottomSheetSnapPoint) => void;
}

export function KindergartenCard(props: KindergartenCardProps) {
  const [, setActiveTab] = useKindergartenTab();

  const openDeparturePointSheet = () =>
    overlay.open(({ isOpen, close }) => (
      <DeparturePointSheet
        isOpen={isOpen}
        close={close}
        to={{ lat: props.coords.lat, lng: props.coords.lng, name: props.title }}
      />
    ));

  const handleReviewClick = () => {
    props.setActiveSnapPoint(1); // 시트 확대 (snapPoint[1])
    setActiveTab('후기'); // 후기 탭 활성화
  };

  return (
    <>
      {/* 컨텐츠 영역 */}
      <div className='pt-x3_5 gap-x3 px-x4 flex w-full flex-col'>
        <div className='gap-x2 flex'>
          {/* 이미지 */}
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${props.banner?.[0]}`}
            className='radius-r2 size-[90px] object-cover'
            alt={`${props.title} 썸네일`}
            width={90}
            height={90}
          />

          {/* 타이틀 및 카테고리 */}
          <div className='gap-x2 flex flex-1 flex-col'>
            <div className='flex items-start justify-between'>
              <div className='gap-x0_5 flex flex-col'>
                <p className='h2-extrabold text-text-primary'>{props.title}</p>
                <span className='label-medium text-text-tertiary'>
                  {props.ctg
                    .split(',')
                    .map((tag) => SERVICE_TAGS[tag.trim() as keyof typeof SERVICE_TAGS] || tag.trim())
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
              <div className='px-x2 py-x1 radius-r2 bg-fill-secondary-50 flex shrink-0 items-center gap-0.5'>
                <Icon icon='Naver' className='size-x4' />
                <span className='caption1-semibold text-text-primary text-center'>리뷰 {props.reviewCount}개</span>
              </div>

              {props.memo?.memoDate && (
                <div className='px-x2 py-x1 radius-r2 bg-fill-secondary-50 flex shrink-0 items-center gap-0.5'>
                  <Icon icon='Note' className='size-x4' />
                  <span className='caption1-semibold text-text-primary'>{props.memo.memoDate}</span>
                  <span className='caption1-semibold text-text-primary'>메모</span>
                </div>
              )}
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
              {props.dist}
            </span>
            <span className='body2-regular text-text-primary col-start-2 row-start-2 overflow-hidden text-ellipsis'>
              {props.roadAddress}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className='bg-line-100 flex h-px w-full items-center justify-center' />

        {/* 하단 필터 + 가격 영역 */}
        <div className='gap-x2 flex min-w-0 items-center justify-between self-stretch'>
          {/* badge 영역 */}
          <ServiceBadgesTruncated serviceTags={props.serviceTags} pickupType={props.pickupType} />

          {/* 가격 영역 */}
          <div className='gap-x1 flex shrink-0 items-center'>
            <span className='body2-regular text-text-primary'>이용요금</span>
            <span className='h3-extrabold text-text-primary'>{props.price.toLocaleString()}~</span>
          </div>
        </div>
      </div>

      <div className='p-x4 gap-x2 flex items-center bg-white pb-[calc(env(safe-area-inset-bottom)+16px)]'>
        <ActionButton variant='primaryLine' size='medium' onClick={props.onPhoneCall}>
          전화하기
        </ActionButton>
        <ActionButton variant='primaryFill' size='medium' onClick={handleReviewClick}>
          후기보기
        </ActionButton>
        <button
          aria-label='보관하기'
          className='radius-r3 bg-fill-primary-50 flex size-11 shrink-0 items-center justify-center'
          onClick={() => props.onBookmarkClick(props.id, props.bookmarked ?? false)}
        >
          <Icon icon={props.bookmarked ? 'BookmarkFill' : 'BookmarkLine'} className='size-x6 text-fill-primary-500' />
        </button>
      </div>
    </>
  );
}
