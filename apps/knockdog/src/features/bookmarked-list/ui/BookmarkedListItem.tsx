'use client';

import { Note, Won, LocationFill } from '@knockdog/icons';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import Image from 'next/image';
import { cn } from '@knockdog/ui/lib';
import type { BookmarkItem } from '@entities/bookmark';
import { BookmarkToggleIcon, formatMemoAt } from '@entities/bookmark';
import type { CTag } from '@entities/compare';
import { s3ToUrl, serializeCategories } from '@entities/compare';
import { getShortAddress } from '@shared/lib';

interface BookmarkedListItemProps {
  kindergarten: BookmarkItem;
  distanceText: string;
  bookmarkDisabled?: boolean;
  className?: string;
  onClick?: () => void;
}

function BookmarkedListItem({
  kindergarten,
  distanceText,
  bookmarkDisabled = false,
  className,
  onClick,
}: BookmarkedListItemProps) {
  const categoryText = serializeCategories(kindergarten.categories as CTag[]);
  const memoDate = kindergarten.memoAt ? formatMemoAt(kindergarten.memoAt) : '';

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-3', className)} onClick={onClick}>
      {/* 썸네일 + 제목 영역 */}
      <div className='flex gap-2'>
        {/* 썸네일 */}
        <Avatar style={{ width: 90, height: 90 }} className='shrink-0 rounded-lg'>
          <AvatarImage src={s3ToUrl(kindergarten.thumbnailS3Key)} alt={kindergarten.name} className='object-cover' />
          <AvatarFallback>
            <Image src='/images/img_default_image.png' alt='default' width={90} height={90} className='object-cover' />
          </AvatarFallback>
        </Avatar>

        {/* 제목 + 배지 */}
        <div className='flex min-w-0 flex-1 flex-col gap-2 py-1'>
          {/* 제목 + 북마크 */}
          <div className='flex items-start justify-between gap-2'>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <h3 className='h2-extrabold text-text-primary truncate'>{kindergarten.name}</h3>
              <p className='label-medium text-text-tertiary truncate'>{categoryText}</p>
            </div>
            {!bookmarkDisabled && (
              <div className='shrink-0'>
                <BookmarkToggleIcon id={kindergarten.id} bookmarked className='text-fill-secondary-700' />
              </div>
            )}
          </div>

          {/* 배지 */}
          <div className='flex items-start gap-1'>
            {/* 네이버 리뷰 배지 */}
            <div className='bg-fill-secondary-50 flex min-w-0 items-center gap-0.5 rounded-lg px-2 py-1'>
              <Icon icon='Naver' className='h-4 w-4' />
              <span className='caption1-semibold text-text-primary shrink-0'>리뷰</span>
              <span className='caption1-semibold text-text-primary truncate'>{kindergarten.reviewCount}개</span>
            </div>

            {/* 메모 배지 */}
            {memoDate && (
              <div className='bg-fill-secondary-50 flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-1'>
                <Note className='text-fill-secondary-700 h-4 w-4' />
                <span className='caption1-semibold text-text-primary'>{memoDate}</span>
                <span className='caption1-semibold text-text-primary'>메모</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 거리 + 요금 정보 */}
      <div className='flex items-center gap-2 text-sm'>
        {/* 거리 */}
        <div className='flex min-w-0 items-center gap-1'>
          <LocationFill className='text-fill-secondary-500 h-4 w-4' />
          <span className='body2-extrabold text-text-primary'>{distanceText}</span>
          <span className='body2-regular text-text-primary truncate'>{getShortAddress(kindergarten.location)}</span>
        </div>

        {/* 구분선 */}
        <div className='bg-line-200 h-3.5 w-px' />

        {/* 이용요금 */}
        <div className='flex shrink-0 items-center gap-1'>
          <Won className='text-fill-secondary-500 h-4 w-4' />
          <span className='body2-extrabold text-text-primary'>이용요금</span>
          <span className='body2-regular text-text-primary'>{kindergarten.price.toLocaleString()}원부터 ~</span>
        </div>
      </div>
    </div>
  );
}

export { BookmarkedListItem };
