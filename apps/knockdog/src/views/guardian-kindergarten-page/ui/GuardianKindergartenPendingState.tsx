'use client';

import Image from 'next/image';

import { guardianKindergartenPendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenPendingContent';
import type { GuardianPendingKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

import { GuardianPendingKindergartenCard } from './GuardianPendingKindergartenCard';

interface GuardianKindergartenPendingStateProps {
  kindergarten: GuardianPendingKindergarten;
}

function GuardianKindergartenPendingState({ kindergarten }: GuardianKindergartenPendingStateProps) {
  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-5 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image
            src={guardianKindergartenPendingContent.imageSrc}
            alt={guardianKindergartenPendingContent.imageAlt}
            fill
            className='object-contain'
            sizes='200px'
            priority
          />
        </div>

        <div className='flex w-full flex-col items-center gap-5'>
          <div className='flex w-full flex-col items-center gap-1'>
            <p className='h2-extrabold text-text-primary'>{guardianKindergartenPendingContent.title}</p>
            <p className='body1-regular text-text-primary'>
              {guardianKindergartenPendingContent.descriptionLines.map((line) => (
                <span key={line} className='block'>
                  {line}
                </span>
              ))}
            </p>
          </div>

          <GuardianPendingKindergartenCard kindergarten={kindergarten} />
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenPendingState };
