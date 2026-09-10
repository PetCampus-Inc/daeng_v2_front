'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface DogCardProps {
  name: string;
  breed?: string;
  age?: number;
  imageUrl?: string;
  isRepresentative?: boolean;
  onClick?: () => void;
}

function DogCard({ name, breed, age, imageUrl, isRepresentative, onClick }: DogCardProps) {
  const ageLabel = age === undefined ? undefined : age < 1 ? '1살 미만' : `${age}살`;
  const resolvedImageUrl = imageUrl?.trim() ? resolvePublicImageSrc(imageUrl.trim()) : '';
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [resolvedImageUrl]);

  const showImage = Boolean(resolvedImageUrl) && !hasImageError;

  return (
    <div
      onClick={onClick}
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        'relative h-[200px] w-[150px] shrink-0 overflow-hidden rounded-2xl',
        !showImage && 'bg-bg-100'
      )}
      style={
        !showImage
          ? {
              backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.8) 80%)',
            }
          : undefined
      }
    >
      {showImage ? (
        // plain img — next/image(/_next/image AVIF)는 AOS WebView에서 깨짐. 펫 수정과 동일 경로.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedImageUrl}
          alt={name}
          draggable={false}
          className='absolute inset-0 size-full object-cover'
          loading='lazy'
          decoding='async'
          referrerPolicy='no-referrer'
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center pb-[34px]'>
          <Icon icon='Paw' className='text-primitive-neutral-300 h-[52px] w-[52px]' />
        </div>
      )}

      {/* Gradient dim overlay */}
      {showImage && (
        <div
          className='absolute inset-x-0 bottom-0 h-[80px]'
          style={{
            background: 'linear-gradient(to bottom, #00000000 0%, #000000CC 80%)',
          }}
        />
      )}

      <div className='absolute bottom-4 left-3 z-10 flex flex-col gap-y-1'>
        <div className='h3-semibold flex max-w-[126px] items-center gap-x-0.5'>
          {isRepresentative && <Icon icon='Maindog' className='text-text-accent size-6 shrink-0' />}
          <span className='text-text-primary-inverse min-w-0 truncate'>{name}</span>
        </div>
        <div className='body2-regular text-text-primary-inverse flex max-w-[126px] items-center gap-x-1'>
          {breed && <span className='min-w-0 truncate'>{breed}</span>}
          {breed && ageLabel && <span className='shrink-0'>•</span>}
          {ageLabel && <span className='shrink-0 whitespace-nowrap'>{ageLabel}</span>}
        </div>
      </div>
    </div>
  );
}

export { DogCard };
