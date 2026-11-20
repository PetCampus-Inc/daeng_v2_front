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
  gender?: 'MALE' | 'FEMALE' | null;
  onClick?: () => void;
}

function DogCard({ name, breed, age, imageUrl, isRepresentative, gender, onClick }: DogCardProps) {
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
      className='border-line-200 bg-bg-0 relative flex h-[190px] w-[140px] shrink-0 flex-col gap-2 overflow-hidden rounded-2xl border pb-3'
    >
      <div className='bg-bg-100 relative h-[130px] w-full shrink-0'>
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
          <div className='flex size-full items-center justify-center'>
            <Icon icon='Paw' className='text-primitive-neutral-300 size-[52px]' />
          </div>
        )}
        {isRepresentative && <Icon icon='Maindog' className='text-text-accent absolute top-2 left-2 size-6' />}
      </div>

      <div className='flex min-w-0 flex-col px-3'>
        <div className='flex items-center gap-x-0.5'>
          <span className='body1-bold text-text-primary min-w-0 truncate'>{name}</span>
          {gender === 'FEMALE' && <Icon icon='Female' className='text-text-accent size-4 shrink-0' />}
          {gender === 'MALE' && <Icon icon='Male' className='text-text-accent size-4 shrink-0' />}
        </div>
        <div className='caption1-regular text-text-secondary flex items-center gap-x-1'>
          {breed && <span className='min-w-0 truncate'>{breed}</span>}
          {breed && ageLabel && <span className='bg-text-secondary size-0.5 shrink-0 rounded-full' />}
          {ageLabel && <span className='shrink-0 whitespace-nowrap'>{ageLabel}</span>}
        </div>
      </div>
    </div>
  );
}

export { DogCard };
