'use client';

import Image from 'next/image';

import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';

function NotificationInboxEmpty() {
  const { empty } = notificationInboxContent;

  return (
    <div className='relative flex min-h-full w-full items-center justify-center'>
      <div className='px-4 flex w-full flex-col items-center gap-1 text-center'>
        <p className='h2-extrabold text-text-primary'>{empty.title}</p>
        <p className='body1-regular text-text-primary'>{empty.description}</p>
      </div>
      <div className='absolute top-[calc(50%-148px)] h-[100px] w-[194px] overflow-hidden'>
        <Image
          src={empty.imageSrc}
          alt={empty.imageAlt}
          fill
          className='object-contain object-bottom'
          sizes='194px'
          priority
        />
      </div>
    </div>
  );
}

export { NotificationInboxEmpty };
