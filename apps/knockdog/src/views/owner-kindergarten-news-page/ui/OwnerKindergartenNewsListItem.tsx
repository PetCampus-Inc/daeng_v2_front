'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import type { OwnerKindergartenNewsListItemView } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';
import { OwnerKindergartenNewsMoreMenu } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsMoreMenu';
import { Skeleton } from '@shared/ui/skeleton';

interface OwnerKindergartenNewsListItemProps {
  item: OwnerKindergartenNewsListItemView;
  onDelete: (newsId: string) => void | Promise<void>;
}

function OwnerKindergartenNewsListItem({ item, onDelete }: OwnerKindergartenNewsListItemProps) {
  const { list } = ownerKindergartenNewsContent;
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);

  return (
    <article className='border-line-200 bg-bg-0 flex w-full flex-col gap-2 border-b p-4'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex min-w-0 items-center gap-1'>
          {item.isAnnouncement ? (
            // eslint-disable-next-line @next/next/no-img-element -- 정적 공지 아이콘
            <img
              src={list.announcementIconSrc}
              alt=''
              width={20}
              height={20}
              className='size-5 shrink-0 object-contain'
              draggable={false}
            />
          ) : null}
          <span className='body2-semibold text-text-secondary shrink-0 whitespace-nowrap'>
            {item.publishedAtLabel}
          </span>
          <span className='body2-regular text-text-secondary shrink-0'>·</span>
          <div className='flex shrink-0 items-center gap-1'>
            <Icon icon='CheckFill' className='text-text-secondary size-4' aria-hidden />
            <span className='caption1-semibold text-text-secondary'>
              {list.readLabel} {item.readCount}
            </span>
          </div>
        </div>
        <OwnerKindergartenNewsMoreMenu newsId={item.id} onDelete={onDelete} />
      </div>

      <div className='flex w-full items-start gap-2'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex w-full items-center gap-1'>
            {item.showNewBadge ? (
              <span className='bg-text-accent size-2 shrink-0 rounded' aria-label={list.newBadgeAriaLabel} />
            ) : null}
            <p className='body1-bold text-text-primary truncate'>{item.title}</p>
          </div>
          <p className='body2-regular text-text-secondary line-clamp-2 whitespace-pre-wrap'>{item.body}</p>
        </div>
        {item.thumbnailUrl ? (
          <div className='radius-r3 relative size-16 shrink-0 overflow-hidden'>
            {!isThumbnailLoaded ? <Skeleton className='absolute inset-0 size-full' /> : null}
            <Image
              src={item.thumbnailUrl}
              alt=''
              fill
              className={`object-cover transition-opacity ${isThumbnailLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes='64px'
              onLoadingComplete={() => setIsThumbnailLoaded(true)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export { OwnerKindergartenNewsListItem };
