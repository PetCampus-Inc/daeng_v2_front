'use client';

import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import type { GuardianKindergartenNewsListItemView } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';
import { GuardianKindergartenNewsThumbnailStrip } from '@views/guardian-kindergarten-news-page/ui/GuardianKindergartenNewsThumbnailStrip';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

interface GuardianKindergartenNewsListItemProps {
  item: GuardianKindergartenNewsListItemView;
  schoolId?: string;
}

function GuardianKindergartenNewsListItem({ item, schoolId }: GuardianKindergartenNewsListItemProps) {
  const content = guardianKindergartenNewsContent;
  const { push } = useStackNavigation();

  const handleOpenDetail = () => {
    void push({
      pathname: route.compare.news.detail.root.replace('[id]', item.id),
      query: schoolId ? { schoolId } : undefined,
    });
  };

  return (
    <article
      role='button'
      tabIndex={0}
      className='bg-bg-0 flex w-full cursor-pointer flex-col gap-3 p-4 shadow-[0_1px_2px_rgba(12,12,13,0.05)]'
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
    >
      <div className='gap-x2 flex w-full items-center'>
        <Avatar className='border-line-100 size-11 shrink-0 border'>
          {item.author.profileImageUrl ? (
            <AvatarImage
              src={item.author.profileImageUrl}
              alt={item.author.name}
              className='object-cover'
            />
          ) : null}
          <AvatarFallback className='bg-bg-50'>
            <Icon icon='Paw' className='text-fill-secondary-300 size-6' aria-hidden />
          </AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-1 items-center justify-between gap-2'>
          <p className='body1-medium text-text-primary truncate'>{item.author.name}</p>
          <p className='body2-semibold text-text-secondary shrink-0'>{item.publishedAtLabel}</p>
        </div>
      </div>

      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full items-center gap-1'>
          {item.isAnnouncement ? (
            // eslint-disable-next-line @next/next/no-img-element -- 정적 공지 아이콘
            <img
              src={content.announcementIconSrc}
              alt=''
              width={20}
              height={20}
              className='size-5 shrink-0 object-contain'
              draggable={false}
            />
          ) : null}
          {item.showNewBadge ? (
            <span
              className='bg-text-accent size-2 shrink-0 rounded'
              aria-label={content.newBadgeAriaLabel}
            />
          ) : null}
          <p className='h3-extrabold text-text-primary truncate'>{item.title}</p>
        </div>

        <p className='body2-regular text-text-secondary line-clamp-3 w-full whitespace-pre-wrap'>
          {item.body}
        </p>

        <GuardianKindergartenNewsThumbnailStrip imageUrls={item.imageUrls} />
      </div>
    </article>
  );
}

export { GuardianKindergartenNewsListItem };
