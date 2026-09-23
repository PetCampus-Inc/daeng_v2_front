'use client';

import { Icon } from '@knockdog/ui';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import type { GuardianKindergartenNewsPreviewItem } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

type GuardianKindergartenNewsSectionVariant = 'list' | 'empty' | 'disconnected';

interface GuardianKindergartenNewsSectionProps {
  variant?: GuardianKindergartenNewsSectionVariant;
  items?: GuardianKindergartenNewsPreviewItem[];
  schoolId?: string;
}

function GuardianKindergartenNewsSection({
  variant = 'list',
  items = [],
  schoolId,
}: GuardianKindergartenNewsSectionProps) {
  const content = guardianKindergartenNewsContent;
  const { push } = useStackNavigation();
  const showViewAll = variant !== 'disconnected';
  const hasItems = variant === 'list' && items.length > 0;

  const handleViewAllClick = () => {
    push({
      pathname: route.compare.news.root,
      query: schoolId ? { schoolId } : undefined,
    });
  };

  const handleItemClick = (newsId: string) => {
    push({
      pathname: route.compare.news.detail.root.replace('[id]', newsId),
      query: schoolId ? { schoolId } : undefined,
    });
  };

  return (
    <section className='flex w-full flex-col items-center justify-center gap-5'>
      <div className='flex w-full items-center justify-between'>
        <p className='h3-extrabold text-text-primary'>{content.sectionTitle}</p>
        {showViewAll ? (
          <button
            type='button'
            className='gap-x1 flex items-center justify-center rounded px-2 py-1'
            onClick={handleViewAllClick}
          >
            <span className='label-semibold text-text-tertiary'>{content.viewAllLabel}</span>
            <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
          </button>
        ) : null}
      </div>

      {hasItems ? (
        <ul className='flex w-full flex-col gap-2'>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type='button'
                className='bg-bg-50 radius-r4 flex min-h-20 w-full flex-col items-start gap-1 px-4 py-4 text-left'
                onClick={() => handleItemClick(item.id)}
              >
                <div className='flex w-full items-center gap-1'>
                  {item.showNewBadge ? (
                    <span
                      className='bg-text-accent size-2 shrink-0 rounded'
                      aria-label={content.newBadgeAriaLabel}
                    />
                  ) : null}
                  <p className='body1-bold text-text-primary truncate'>{item.title}</p>
                </div>
                <p className='body2-regular text-text-secondary line-clamp-2 w-full whitespace-pre-wrap'>
                  {item.body}
                </p>
                <p className='body2-semibold text-text-secondary'>{item.publishedAtLabel}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className='flex min-h-[120px] w-full flex-col items-center justify-center gap-1 px-4 py-6'>
          <p className='body1-bold text-text-secondary text-center'>
            {variant === 'disconnected' ? content.disconnectedTitle : content.emptyTitle}
          </p>
          <p className='body2-regular text-text-tertiary text-center'>
            {variant === 'disconnected' ? content.disconnectedDescription : content.emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}

export { GuardianKindergartenNewsSection };
export type { GuardianKindergartenNewsSectionProps, GuardianKindergartenNewsSectionVariant };
