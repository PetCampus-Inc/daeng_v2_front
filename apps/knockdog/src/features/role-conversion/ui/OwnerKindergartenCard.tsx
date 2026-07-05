'use client';

import Image from 'next/image';

import { Icon } from '@knockdog/ui';

interface OwnerKindergartenCardProps {
  name: string;
  address: string;
  imageUrl?: string | null;
  usesDefaultImage?: boolean;
  onClick?: () => void;
}

function OwnerKindergartenCard({
  name,
  address,
  imageUrl,
  usesDefaultImage = false,
  onClick,
}: OwnerKindergartenCardProps) {
  const content = (
    <>
      <div className='px-4'>
        <div className='radius-r3 relative h-[126px] w-full overflow-hidden'>
          {usesDefaultImage || !imageUrl ? (
            <div className='bg-fill-secondary-50 size-full' />
          ) : (
            <Image src={imageUrl} alt={name} fill sizes='100vw' className='object-cover' priority />
          )}
        </div>
      </div>

      <div className='flex items-center justify-between gap-x-7 p-4'>
        <div className='flex min-w-0 flex-col gap-1'>
          <p className='h3-extrabold text-text-primary truncate'>{name}</p>
          <p className='body2-regular text-text-primary truncate'>{address}</p>
        </div>
        <Icon icon='ChevronRight' className='text-text-tertiary size-6 shrink-0' aria-hidden />
      </div>
    </>
  );

  if (!onClick) {
    return <div className='flex flex-col pt-4 pb-5'>{content}</div>;
  }

  return (
    <button type='button' onClick={onClick} className='flex w-full flex-col pt-4 pb-5 text-left'>
      {content}
    </button>
  );
}

export { OwnerKindergartenCard };
export type { OwnerKindergartenCardProps };
