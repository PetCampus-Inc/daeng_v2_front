'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';

function GuardianAlbumMonthEmpty() {
  const { monthEmpty } = guardianAlbumContent;

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center p-4'>
      <div className='flex w-full flex-col items-center gap-1 text-center'>
        <p className='h2-extrabold text-text-primary'>{monthEmpty.title}</p>
        <p className='body1-regular text-text-primary'>{monthEmpty.description}</p>
      </div>
    </div>
  );
}

export { GuardianAlbumMonthEmpty };
