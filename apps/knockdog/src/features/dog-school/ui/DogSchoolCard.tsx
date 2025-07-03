import { Icon } from '@knockdog/ui';
import { CardBtnClipDefs } from './CardBtnClipDefs';
import { DogSchoolImageSlider } from '@entities/dog-school';
import type { DogSchool } from '@entities/dog-school';

type DogSchoolCardProps = DogSchool & {
  onBookmarkClick?: (id: string) => void;
};

export function DogSchoolCard({
  providerId,
  providerName,
  images,
  businessType,
  userDistance,
  address,
  reviewCount,
  operationStatus,
  operationTimes,
  price,
  bookmarked = false,
}: DogSchoolCardProps) {
  return (
    <div className='gap-x4 px-x4 py-x6 border-line-100 flex w-full flex-col items-center border-b-8'>
      {/* 이미지 컨테이너 */}
      <div className='relative aspect-[16/9] w-full overflow-hidden'>
        <DogSchoolImageSlider
          id={providerId}
          name={providerName}
          slides={images}
        />
        <CardBtnClipDefs id={providerId} />
        {/* 북마크 버튼 */}
        <button
          className='bg-bg-0 absolute right-0 top-0 z-10 flex h-[19.9%] min-h-[32px] w-[11.17%] min-w-[32px] items-center justify-center border-0 p-0'
          style={{ clipPath: `url(#card-btn-${providerId})` }}
        >
          <Icon
            icon={bookmarked ? 'BookmarkFill' : 'BookmarkLine'}
            className={`size-x6 ${bookmarked ? 'text-fill-secondary-700' : 'text-fill-secondary-500'}`}
          />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className='gap-x3 flex w-full flex-col'>
        {/* 컨텐츠 상단 영역 */}
        <div className='gap-x2 flex min-w-0 items-start justify-between self-stretch'>
          {/* 타이틀 */}
          <div className='flex min-w-0 flex-col items-start justify-center gap-[2px]'>
            <h1 className='h2-extrabold text-text-primary w-full truncate'>
              {providerName}
            </h1>
            <p className='body2-regular text-text-tertiary w-full truncate'>
              {businessType.join(' • ')}
            </p>
          </div>

          {/* 네이버 리뷰 badge */}
          <div className='px-x2 py-x1 radius-r2 bg-fill-secondary-50 flex shrink-0 items-center gap-[2px]'>
            <Icon icon='Naver' className='size-x4' />
            <span className='caption1-semibold text-text-primary text-center'>
              리뷰 {reviewCount}개
            </span>
          </div>
        </div>

        {/* 영업 정보 및 주소 영역 */}
        <div className='flex flex-col gap-y-1 self-stretch'>
          <div className='grid grid-cols-[minmax(52px,max-content)_1fr] grid-rows-2 gap-x-2 gap-y-2 self-stretch'>
            <span className='body2-extrabold text-text-accent col-start-1 row-start-1 overflow-hidden text-ellipsis whitespace-nowrap'>
              {operationStatus === 'OPEN' ? '영업중' : '영업종료'}
            </span>
            <span className='body2-regular text-text-secondary col-start-2 row-start-1 overflow-hidden text-ellipsis'>
              {operationTimes.endTime}에 영업종료
            </span>
            <span className='body2-extrabold text-text-primary col-start-1 row-start-2 overflow-hidden text-ellipsis whitespace-nowrap'>
              {userDistance}km
            </span>
            <span className='body2-regular text-text-secondary col-start-2 row-start-2 overflow-hidden text-ellipsis'>
              {address}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className='bg-line-100 flex h-[1px] w-full items-center justify-center' />

        {/* 하단 필터 + 가격 영역 */}
        <div className='flex min-w-0 items-center justify-between self-stretch'>
          {/* chips 영역 */}
          <div className='gap-x1 flex min-w-0 items-center'>
            {/* 무료픽드랍 chip */}
            <div className='px-x2 py-x1 gap-x1 bg-fill-secondary-700 flex shrink-0 items-center justify-center rounded-full'>
              <Icon
                icon='PickupFree'
                className='size-x4 text-fill-secondary-100 flex items-center justify-center'
              />
              <span className='caption1-semibold text-text-primary-inverse overflow-hidden text-ellipsis'>
                무료 픽드랍
              </span>
            </div>

            {/* 24시간 상주 chip */}
            <div className='px-x2 py-x1 border-line-200 bg-fill-secondary-0 flex shrink-0 items-center justify-center gap-[2px] rounded-full border'>
              <span className='caption1-semibold text-text-secondary'>
                24시간 상주
              </span>
            </div>

            {/* 외 영역 */}
            <div className='flex shrink-0 items-center gap-[2px]'>
              <span className='caption1-semibold text-text-tertiary'>
                외 +3
              </span>
            </div>
          </div>

          {/* 가격 영역 */}
          <div className='gap-x1 flex shrink-0 items-center'>
            <span className='body2-regular text-text-primary'>이용요금</span>
            <span className='h3-extrabold text-text-primary'>
              {price.toLocaleString()}~
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
