'use client';

import { useState } from 'react';
import Image from 'next/image';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { GUARDIAN_KINDERGARTEN_NEWS_THUMB_LIMIT } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';
import { Skeleton } from '@shared/ui/skeleton';
import { cn } from '@knockdog/ui/lib';

interface GuardianKindergartenNewsThumbnailStripProps {
  imageUrls: string[];
  className?: string;
}

function GuardianKindergartenNewsThumbnailStrip({
  imageUrls,
  className,
}: GuardianKindergartenNewsThumbnailStripProps) {
  if (imageUrls.length === 0) return null;

  const previewUrls = imageUrls.slice(0, GUARDIAN_KINDERGARTEN_NEWS_THUMB_LIMIT);
  const remainingCount = imageUrls.length - GUARDIAN_KINDERGARTEN_NEWS_THUMB_LIMIT;
  const count = previewUrls.length;

  if (count === 1) {
    return (
      <div className={cn('radius-r4 relative h-40 w-full overflow-hidden', className)}>
        <ThumbnailImage src={previewUrls[0]!} sizes='100vw' />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={cn('flex h-40 w-full gap-2 overflow-hidden', className)}>
        {previewUrls.map((url) => (
          <div key={url} className='radius-r4 relative h-full min-w-0 flex-1 overflow-hidden'>
            <ThumbnailImage src={url} sizes='50vw' />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('radius-r4 flex h-40 w-full gap-1 overflow-x-auto overflow-y-hidden', className)}
    >
      {previewUrls.map((url, index) => {
        const isOverflowTile =
          remainingCount > 0 && index === GUARDIAN_KINDERGARTEN_NEWS_THUMB_LIMIT - 1;

        return (
          <div key={`${url}-${index}`} className='relative size-40 shrink-0 overflow-hidden'>
            <ThumbnailImage src={url} sizes='160px' />
            {isOverflowTile ? (
              <div className='bg-dim-70 absolute inset-0 z-10 flex items-center justify-center'>
                <span className='caption2-medium text-text-primary-inverse'>
                  {guardianKindergartenNewsContent.overflowLabel(remainingCount)}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface ThumbnailImageProps {
  src: string;
  sizes: string;
}

function ThumbnailImage({ src, sizes }: ThumbnailImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded ? <Skeleton className='absolute inset-0 size-full' /> : null}
      <Image
        src={src}
        alt=''
        fill
        className={cn('object-cover transition-opacity', isLoaded ? 'opacity-100' : 'opacity-0')}
        sizes={sizes}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </>
  );
}

export { GuardianKindergartenNewsThumbnailStrip };
