import Image from 'next/image';

import { memberTicketListContent } from '@views/owner/member-ticket-list/config/memberTicketListContent';

function MemberTicketListEmpty() {
  const content = memberTicketListContent;

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center px-5 py-4'>
      <div className='flex w-full flex-col items-center gap-1 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image
            src={content.emptyImageSrc}
            alt=''
            width={200}
            height={136}
            className='absolute inset-x-0 top-[23.5%]'
            priority
          />
        </div>
        <div className='flex w-full flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{content.emptyTitle}</p>
          <p className='body1-regular text-text-secondary'>{content.emptyDescription}</p>
        </div>
      </div>
    </div>
  );
}

export { MemberTicketListEmpty };
