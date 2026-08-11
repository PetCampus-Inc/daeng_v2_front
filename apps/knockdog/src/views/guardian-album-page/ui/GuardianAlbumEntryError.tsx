'use client';

import Image from 'next/image';
import { ActionButton } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';

interface GuardianAlbumEntryErrorProps {
  isRetrying?: boolean;
  onRetry: () => void;
}

/** 진입 기준 데이터 조회 실패 — 헤더 아래 본문(Figma 558:12276) */
function GuardianAlbumEntryError({ isRetrying = false, onRetry }: GuardianAlbumEntryErrorProps) {
  const { entryError } = guardianAlbumContent;

  return (
    <>
      <main className='bg-bg-0 flex min-h-0 flex-1 flex-col items-center justify-center px-4'>
        <div className='flex w-full flex-col items-center gap-10'>
          <div className='relative size-[200px] shrink-0'>
            <Image
              src={entryError.imageSrc}
              alt={entryError.imageAlt}
              fill
              className='object-contain'
              sizes='200px'
              priority
            />
          </div>
          <div className='flex w-full flex-col items-center gap-1 text-center'>
            <h1 className='h2-extrabold text-text-primary'>{entryError.title}</h1>
            <p className='body1-regular text-text-primary'>{entryError.description}</p>
          </div>
        </div>
      </main>
      <div className='bg-bg-0 shrink-0 px-4 py-5 pb-[max(1.25rem,var(--safe-area-inset-bottom,0px))]'>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          disabled={isRetrying}
          onClick={onRetry}
        >
          {entryError.retryLabel}
        </ActionButton>
      </div>
    </>
  );
}

export { GuardianAlbumEntryError };
