'use client';

import Image from 'next/image';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';

function GuardianAlbumEmptyState() {
  const { empty } = guardianAlbumContent;

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-5 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image src={empty.imageSrc} alt={empty.imageAlt} fill className='object-contain' sizes='200px' priority />
        </div>
        <div className='flex w-full flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{empty.title}</p>
          <p className='body1-regular text-text-primary whitespace-pre-line'>{empty.description}</p>
        </div>
      </div>
    </div>
  );
}

export { GuardianAlbumEmptyState };
