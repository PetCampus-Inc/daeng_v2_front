'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Icon } from '@knockdog/ui';

interface OwnerKindergartenCardProps {
  name: string;
  address: string;
  imageUrl?: string | null;
  usesDefaultImage?: boolean;
  onClick?: () => void;
}

const getKindergartenImageSrc = (imageUrl?: string | null) => {
  const source = imageUrl?.trim();
  if (!source) return null;
  if (/^\/(?![\\/])/.test(source)) return source;

  try {
    const url = new URL(source);
    return url.protocol === 'https:' || url.protocol === 'http:' ? source : null;
  } catch {
    return null;
  }
};

const KindergartenPhoto = ({
  imageUrl,
  usesDefaultImage,
}: {
  imageUrl?: string | null;
  usesDefaultImage: boolean;
}) => {
  const source = getKindergartenImageSrc(imageUrl);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (usesDefaultImage || !source || failedSource === source) {
    return (
      <div className='bg-fill-secondary-50 absolute inset-0 flex items-center justify-center' aria-hidden='true'>
        <Icon icon='Paw' className='text-fill-secondary-300 size-12' />
      </div>
    );
  }

  return (
    <>
      <Image
        src={source}
        alt=''
        fill
        sizes='100vw'
        className='object-cover'
        priority
        onError={() => setFailedSource(source)}
      />
      <span className='absolute inset-0 bg-black/20' aria-hidden='true' />
    </>
  );
};

function OwnerKindergartenCard({
  name,
  address,
  imageUrl,
  usesDefaultImage = false,
  onClick,
}: OwnerKindergartenCardProps) {
  const content = (
    <div className='border-line-200 radius-r3 relative flex h-[210px] w-full flex-col justify-end overflow-hidden border'>
      <KindergartenPhoto imageUrl={imageUrl} usesDefaultImage={usesDefaultImage} />
      <div className='bg-bg-50 relative flex items-center justify-between py-4 pr-4 pl-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)]'>
        <div className='flex min-w-0 flex-col gap-1'>
          <p className='h3-semibold text-text-primary truncate'>{name}</p>
          <p className='caption1-regular text-text-tertiary truncate'>{address}</p>
        </div>
        <span className='flex size-8 shrink-0 items-center justify-center'>
          <Icon icon='ChevronRight' className='text-text-tertiary size-4' aria-hidden />
        </span>
      </div>
    </div>
  );

  if (!onClick) {
    return <div className='px-4 pt-2 pb-5'>{content}</div>;
  }

  return (
    <button type='button' onClick={onClick} className='w-full px-4 pt-2 pb-5 text-left'>
      {content}
    </button>
  );
}

export { OwnerKindergartenCard };
export type { OwnerKindergartenCardProps };
