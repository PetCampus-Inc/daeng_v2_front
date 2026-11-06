'use client';

import Image from 'next/image';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

function OwnerAlbumEmptyState() {
  const { empty } = ownerAlbumContent;

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-y-2 text-center'>
        <div className='relative h-[160px] w-[200px]'>
          <Image src={empty.imageSrc} alt={empty.imageAlt} fill className='object-contain' sizes='200px' priority />
        </div>
        <div className='flex flex-col items-center gap-y-1'>
          <p className='h2-extrabold text-text-primary'>{empty.title}</p>
          <p className='body1-regular text-text-secondary'>{empty.description}</p>
        </div>
      </div>
    </div>
  );
}

export { OwnerAlbumEmptyState };
