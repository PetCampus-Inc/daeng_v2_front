'use client';

import Image from 'next/image';

import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';

function NotificationInboxEmpty() {
  const { empty } = notificationInboxContent;

  return (
    <div className='flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6 px-4 py-5'>
      <div className='relative h-[100px] w-[194px] shrink-0 overflow-hidden'>
        <Image
          src={empty.imageSrc}
          alt={empty.imageAlt}
          fill
          className='object-contain object-bottom'
          sizes='194px'
          priority
        />
      </div>
      <div className='flex w-full flex-col items-center gap-1 text-center'>
        <p className='h2-extrabold text-text-primary'>{empty.title}</p>
        <p className='body1-regular text-text-primary'>{empty.description}</p>
      </div>
    </div>
  );
}

export { NotificationInboxEmpty };
