'use client';

import Image from 'next/image';

import { guardianKindergartenEmptyContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenEmptyContent';

function GuardianKindergartenEmptyState() {
  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-5 text-center'>
        <div className='relative flex h-[200px] w-full items-center justify-center'>
          <div className='relative h-[200px] w-[180px]'>
            <Image
              src={guardianKindergartenEmptyContent.imageSrc}
              alt={guardianKindergartenEmptyContent.imageAlt}
              fill
              className='object-contain'
              sizes='180px'
              priority
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{guardianKindergartenEmptyContent.title}</p>
          <p className='body1-regular text-text-primary'>{guardianKindergartenEmptyContent.description}</p>
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenEmptyState };
