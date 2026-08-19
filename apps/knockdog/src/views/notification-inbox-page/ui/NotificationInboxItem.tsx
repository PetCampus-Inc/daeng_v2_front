'use client';

import { cn } from '@knockdog/ui/lib';

import type { NotificationInboxItem as NotificationInboxItemModel } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { formatNotificationRelativeTime } from '@views/notification-inbox-page/lib/formatNotificationRelativeTime';

interface NotificationInboxItemProps {
  item: NotificationInboxItemModel;
  onClick?: (item: NotificationInboxItemModel) => void;
}

function NotificationInboxItem({ item, onClick }: NotificationInboxItemProps) {
  const relativeTime = formatNotificationRelativeTime(item.sentAt);
  const imageSrc = item.kindergartenImageUrl;

  const handleClick = () => {
    onClick?.(item);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn(
        'border-line-200 flex w-full items-center border-b p-4 text-left',
        item.isRead ? 'bg-bg-0' : 'bg-fill-primary-50'
      )}
    >
      <div className='gap-x3 flex min-w-0 flex-1 items-center'>
        <div className='bg-bg-100 relative size-[50px] shrink-0 overflow-hidden rounded-lg'>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- S3 배너 키는 지도 카드와 동일하게 img로 로드
            <img
              src={imageSrc}
              alt={item.kindergartenName}
              className='size-full object-cover'
              loading='lazy'
              decoding='async'
              referrerPolicy='no-referrer'
            />
          ) : null}
        </div>

        <div className='gap-x1 flex min-w-0 flex-1 flex-col items-start justify-center'>
          {item.kindergartenName ? (
            <p className='label-medium text-text-tertiary w-full truncate'>{item.kindergartenName}</p>
          ) : null}
          <p className='body1-bold text-text-primary w-full'>{item.title}</p>
          <p className='body2-regular text-text-secondary w-full'>{item.body}</p>
          <p className='body2-regular text-text-secondary'>
            {item.petName ? (
              <>
                {item.petName}
                <span aria-hidden>∙</span>
              </>
            ) : null}
            {relativeTime}
          </p>
        </div>
      </div>
    </button>
  );
}

export { NotificationInboxItem };
