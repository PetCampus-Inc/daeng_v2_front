import Image from 'next/image';
import { Icon } from '@knockdog/ui';
import { ServiceBadgesTruncated, OPEN_STATUS_MAP, CTAG_MAP, type KindergartenNear } from '@entities/kindergarten';
import { BookmarkToggleIcon } from '@entities/bookmark';

interface KindergartenNearProps extends KindergartenNear {}

const KindergartenNearCard = ({
  id,
  title,
  image,
  ctg,
  dist,
  roadAddress,
  reviewCount,
  operationStatus,
  operationDescription,
  price,
  serviceTags,
  pickupType,
  memoDate,
  bookmarked = false,
}: KindergartenNearProps) => {
  return (
    <div className='min-w-[233px]'>
      <div className='relative mb-2 rounded-lg'>
        <Image
          src={image}
          alt='페이지 이미지'
          width={233}
          height={142}
          className='h-[142px] w-[233px] rounded-lg object-cover'
        />
        {/* 뱃지 리스트 */}
        <div className='absolute bottom-2 left-2 flex gap-1'>
          <div className='text-size-caption1 flex gap-[2px] rounded-md bg-[#0F141A] px-2 py-1 text-neutral-100 opacity-70'>
            <Icon icon='Naver' className='h-[16px] w-[16px]' />
            리뷰 {reviewCount}개
          </div>
          {memoDate && (
            <div className='text-size-caption1 flex gap-[2px] rounded-md bg-[#0F141A] px-2 py-1 text-neutral-100 opacity-70'>
              <Icon icon='Note' className='h-[16px] w-[16px]' />
              {memoDate} 노트
            </div>
          )}
        </div>
      </div>
      <div className='mb-3'>
        {/* 내용 영역 */}
        <div className='flex justify-between'>
          <span className='body1-extrabold'>{title}</span>
          <BookmarkToggleIcon id={id} bookmarked={bookmarked} />
        </div>
        <span className='body2-regular text-text-tertiary'>
          {ctg
            .split(',')
            .map((tag) => CTAG_MAP[tag.trim() as keyof typeof CTAG_MAP])
            .filter(Boolean)
            .join(' ・ ')}
        </span>
        <div>
          <span className='body2-bold mr-1 inline-block min-w-[52px]'>{dist.toFixed(2)}km</span>
          <span className='body2-regular text-text-tertiary'>{roadAddress}</span>
        </div>
        <div>
          <span className='body2-bold min-w-13 text-text-accent mr-1 inline-block'>
            {OPEN_STATUS_MAP[operationStatus]}
          </span>
          <span className='body2-regular text-text-tertiary'>{operationDescription}</span>
        </div>
        <div>
          <span className='body2-bold min-w-13 mr-1 inline-block'>이용요금</span>
          <span className='body2-bold'>{price.toLocaleString()}원~</span>
        </div>
      </div>

      <ServiceBadgesTruncated serviceTags={serviceTags} pickupType={pickupType} />
    </div>
  );
};

export { KindergartenNearCard };
