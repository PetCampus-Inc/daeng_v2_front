'use client';

import Image from 'next/image';

import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';

function GuardianConnectionApplyStatusEmpty() {
  const { empty } = guardianConnectionApplyStatusContent;

  return (
    <div className='flex min-h-full w-full flex-1 flex-col items-center justify-center gap-5 px-4 py-5'>
      <div className='relative h-[140px] w-[200px] shrink-0 overflow-hidden'>
        <Image
          src={empty.imageSrc}
          alt={empty.imageAlt}
          fill
          className='object-contain object-bottom'
          sizes='200px'
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

export { GuardianConnectionApplyStatusEmpty };
