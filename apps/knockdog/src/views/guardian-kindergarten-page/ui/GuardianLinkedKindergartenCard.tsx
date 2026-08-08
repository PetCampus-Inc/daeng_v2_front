'use client';

import { Icon } from '@knockdog/ui';

import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useStackNavigation } from '@shared/lib/bridge';

interface GuardianLinkedKindergartenCardProps {
  kindergarten: GuardianLinkedKindergarten;
}

function GuardianLinkedKindergartenCard({ kindergarten }: GuardianLinkedKindergartenCardProps) {
  const { push } = useStackNavigation();
  const imageSrc = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? ''}${kindergarten.imageUrl}`;

  const handleClick = () => {
    push({ pathname: `/kindergarten/${kindergarten.id}` });
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className='border-line-200 radius-r3 bg-bg-0 flex h-[74px] w-full items-center justify-between border p-4 text-left'
    >
      <div className='gap-x2 flex min-w-0 items-center'>
        <div className='relative size-11 shrink-0 overflow-hidden rounded-lg'>
          {/* eslint-disable-next-line @next/next/no-img-element -- S3 배너 키는 지도 카드와 동일하게 img로 로드 */}
          <img
            src={imageSrc}
            alt={kindergarten.name}
            className='size-full object-cover'
            loading='lazy'
            decoding='async'
            referrerPolicy='no-referrer'
          />
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
