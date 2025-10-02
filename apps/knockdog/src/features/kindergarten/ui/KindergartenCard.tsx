import { Icon } from '@knockdog/ui';
import { CardBtnClipDefs } from './CardBtnClipDefs';
import { BannerImageSlider } from './BannerImageSlider';
import { ServiceBadgeGroup } from './ServiceBadgeGroup';
import type { DogSchoolWithMeta } from '../model/mappers';

interface KindergartenCardProps extends DogSchoolWithMeta {
  onBookmarkClick?: (id: string) => void;
}

export function KindergartenCard({
  id,
  title,
  images,
  ctg,
  dist,
  roadAddress,
  reviewCount,
  operationStatus,
  operationTimes,
  price,
  serviceTags,
  pickupType,
  memo,
  isBookmarked = false,
  onBookmarkClick,
}: KindergartenCardProps) {
  return (
    <div className='gap-x4 px-x4 py-x6 border-line-100 flex w-full flex-col items-center border-b-8'>
      {/* 이미지 컨테이너 */}
      <div className='relative aspect-[16/9] w-full overflow-hidden'>
        <BannerImageSlider id={id} name={title} slides={images} />
        <CardBtnClipDefs id={id} />
        {/* 북마크 버튼 */}
        <button
          className='bg-bg-0 absolute right-0 top-0 z-10 flex h-[19.9%] min-h-[32px] w-[11.17%] min-w-[32px] items-center justify-center border-0 p-0'
          style={{ clipPath: `url(#card-btn-${id})` }}
          onClick={() => onBookmarkClick?.(id)}
        >
          <Icon
            icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'}
            className={`size-x6 ${isBookmarked ? 'text-fill-secondary-700' : 'text-fill-secondary-500'}`}
          />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className='gap-x3 flex w-full flex-col'>
        {/* 컨텐츠 상단 영역 */}
        <div className='gap-x2 flex min-w-0 items-start justify-between self-stretch'>
          {/* 타이틀 */}
          <div className='flex min-w-0 flex-col items-start justify-center gap-[2px]'>
            <h1 className='h2-extrabold text-text-primary w-full truncate'>{title}</h1>
            <p className='body2-regular text-text-tertiary w-full truncate'>
              {ctg
                .split(',')
                .map((tag) => tag.trim())
                .join(' ・ ')}
            </p>
          </div>

          {/* 네이버 리뷰 badge */}
          <div className='px-x2 py-x1 radius-r2 bg-fill-secondary-50 flex shrink-0 items-center gap-[2px]'>
            <Icon icon='Naver' className='size-x4' />
            <span className='caption1-semibold text-text-primary text-center'>리뷰 {reviewCount}개</span>
          </div>
        </div>

        {/* 영업 정보 및 주소 영역 */}
        <div className='flex flex-col gap-y-1 self-stretch'>
          <div className='grid grid-cols-[minmax(52px,max-content)_1fr] grid-rows-2 gap-x-2 gap-y-2 self-stretch'>
            <span className='body2-extrabold text-text-accent col-start-1 row-start-1 overflow-hidden text-ellipsis whitespace-nowrap'>
              {operationStatus === 'OPEN' ? '영업중' : '영업종료'}
            </span>
            <span className='body2-regular text-text-primary col-start-2 row-start-1 overflow-hidden text-ellipsis'>
              {operationStatus === 'OPEN'
                ? `${operationTimes.endTime}에 영업종료`
                : `${operationTimes.startTime}에 영업시작`}
            </span>
            <span className='body2-extrabold text-text-primary col-start-1 row-start-2 overflow-hidden text-ellipsis whitespace-nowrap'>
              {dist.toFixed(2)}km
            </span>
            <span className='body2-regular text-text-primary col-start-2 row-start-2 overflow-hidden text-ellipsis'>
              {roadAddress}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className='bg-line-100 flex h-[1px] w-full items-center justify-center' />

        {/* 메모 영역 */}
        {memo && (
          <div className='bg-fill-secondary-100 px-x3 py-x4 gap-x1 radius-r2 flex w-full flex-col'>
            <div className='gap-x1 flex items-center'>
              <Icon icon='Note' className='size-x4 text-fill-secondary-600' />
              <span className='caption1-extrabold text-primitive-neutral-700'>{memo.updatedAt} 메모</span>
            </div>
            <p className='body2-regular text-text-primary line-clamp-2'>{memo.content}</p>
          </div>
        )}

        {/* 하단 필터 + 가격 영역 */}
        <div className='gap-x2 flex min-w-0 items-center justify-between self-stretch'>
          {/* badge 영역 */}
          <ServiceBadgeGroup serviceTags={serviceTags} pickupType={pickupType} />

          {/* 가격 영역 */}
          <div className='gap-x1 flex shrink-0 items-center'>
            <span className='body2-regular text-text-primary'>이용요금</span>
            <span className='h3-extrabold text-text-primary'>{price.toLocaleString()}~</span>
          </div>
        </div>
      </div>
    </div>
  );
}
