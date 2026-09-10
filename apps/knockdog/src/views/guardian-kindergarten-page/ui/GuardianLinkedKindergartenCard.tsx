'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useStackNavigation } from '@shared/lib/bridge';
import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface GuardianLinkedKindergartenCardProps {
  kindergarten: GuardianLinkedKindergarten;
}

function canUseNextImage(src: string) {
  return /^https?:/i.test(src);
}

function GuardianLinkedKindergartenCard({ kindergarten }: GuardianLinkedKindergartenCardProps) {
  const { push } = useStackNavigation();
  const imageSrc = resolvePublicImageSrc(kindergarten.imageUrl);
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(imageSrc) && !hasImageError;
  const useOptimized = showImage && canUseNextImage(imageSrc);

  const handleClick = () => {
    if (!kindergarten.placeId) return;
    push({ pathname: `/kindergarten/${kindergarten.placeId}`, params: { entrySource: 'kindergarten-list' } });
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className='border-line-200 radius-r3 bg-bg-0 flex h-[74px] w-full items-center justify-between border p-4 text-left'
    >
      <div className='gap-x2 flex min-w-0 items-center'>
        <div className='relative size-11 shrink-0 overflow-hidden rounded-lg'>
          {showImage ? (
            useOptimized ? (
              <Image
                src={imageSrc}
                alt={kindergarten.name}
                fill
                sizes='44px'
                quality={70}
                className='object-cover'
                loading='lazy'
                onError={() => setHasImageError(true)}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element -- 비http(s) 키/특수 소스 fallback */
              <img
                src={imageSrc}
                alt={kindergarten.name}
                className='size-full object-cover'
                loading='lazy'
                decoding='async'
                referrerPolicy='no-referrer'
                onError={() => setHasImageError(true)}
              />
            )
          ) : (
            <div
              className='bg-fill-secondary-50 flex size-full items-center justify-center'
              aria-hidden='true'
            >
              <Icon icon='Paw' className='text-fill-secondary-300 size-5' />
            </div>
          )}
        </div>
        <div className='flex min-w-0 flex-col items-start'>
          <p className='body1-bold text-text-primary w-full truncate'>{kindergarten.name}</p>
          <p className='body2-regular text-text-secondary w-full truncate'>{kindergarten.address}</p>
        </div>
      </div>
      <Icon icon='ChevronRight' className='text-fill-secondary-500 size-6 shrink-0' />
    </button>
  );
}

export { GuardianLinkedKindergartenCard };
