'use client';

import Image from 'next/image';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';

function OwnerKindergartenNewsEmptyState() {
  const { empty } = ownerKindergartenNewsContent;

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center'>
      <div className='flex w-full flex-col items-center gap-5 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image src={empty.imageSrc} alt={empty.imageAlt} fill className='object-contain' sizes='200px' priority />
        </div>
        <div className='flex flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{empty.title}</p>
          <p className='body1-regular text-text-primary'>{empty.description}</p>
        </div>
      </div>
    </div>
  );
}

export { OwnerKindergartenNewsEmptyState };
