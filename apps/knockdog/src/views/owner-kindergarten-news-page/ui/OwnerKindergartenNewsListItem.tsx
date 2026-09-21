'use client';

import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

interface OwnerKindergartenNewsListItemProps {
  item: OwnerKindergartenNewsItem;
  onMoreClick?: (item: OwnerKindergartenNewsItem) => void;
}

function OwnerKindergartenNewsListItem({ item, onMoreClick }: OwnerKindergartenNewsListItemProps) {
  const { list } = ownerKindergartenNewsContent;

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
        <button
          type='button'
          aria-label={list.moreAriaLabel}
          className='inline-flex size-6 shrink-0 items-center justify-center'
          onClick={(event) => {
            event.stopPropagation();
            onMoreClick?.(item);
          }}
        >
          <Icon icon='More' className='text-fill-secondary-700 size-6 rotate-90' />
        </button>
      </div>

      <div className='flex w-full items-start gap-2'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex w-full items-center gap-1'>
            {item.isUnread ? (
              <span className='bg-text-accent size-2 shrink-0 rounded' aria-label={list.unreadAriaLabel} />
            ) : null}
            <p className='body1-bold text-text-primary truncate'>{item.title}</p>
          </div>
          <p className='body2-regular text-text-secondary line-clamp-2 whitespace-pre-wrap'>{item.body}</p>
        </div>
        {item.thumbnailUrl ? (
          <div className='radius-r3 relative size-16 shrink-0 overflow-hidden'>
            <Image
              src={item.thumbnailUrl}
              alt=''
              fill
              className='object-cover'
              sizes='64px'
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export { OwnerKindergartenNewsListItem };
