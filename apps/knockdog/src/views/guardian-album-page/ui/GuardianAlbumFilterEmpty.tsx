'use client';

import Image from 'next/image';
import { ActionButton, Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumViewMode } from '@views/guardian-album-page/model/guardianAlbumViewMode';

interface GuardianAlbumFilterEmptyProps {
  viewMode: Extract<GuardianAlbumViewMode, 'favorite' | 'attendance'>;
  onResetToAll: () => void;
}

function GuardianAlbumFilterEmpty({ viewMode, onResetToAll }: GuardianAlbumFilterEmptyProps) {
  const { filterEmpty } = guardianAlbumContent;
  const copy = filterEmpty[viewMode];

  return (
    <div className='bg-bg-0 flex min-h-0 w-full flex-1 items-center justify-center'>
      <div className='flex w-full max-w-[358px] flex-col items-center gap-5 px-4 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image
            src={filterEmpty.imageSrc}
            alt={filterEmpty.imageAlt}
            fill
            className='object-contain'
            sizes='200px'
            priority
          />
        </div>

        <div className='flex w-full flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{copy.title}</p>
          <p className='body1-regular text-text-primary whitespace-pre-line'>{copy.description}</p>
        </div>

        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='w-auto'
          onClick={onResetToAll}
        >
          {filterEmpty.ctaLabel}
          <Icon icon='ChevronRight' className='text-text-primary-inverse size-5' aria-hidden='true' />
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianAlbumFilterEmpty };
