'use client';

import Image from 'next/image';

import { guardianKindergartenPendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenPendingContent';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

import { GuardianKindergartenHomeSegment } from './GuardianKindergartenHomeSegment';
import { GuardianDiarySegmentFrame } from './GuardianDiarySegmentFrame';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenPendingStateProps {
  kindergarten: GuardianLinkedKindergarten;
}

function GuardianKindergartenPendingState({ kindergarten }: GuardianKindergartenPendingStateProps) {
  return (
    <GuardianDiarySegmentFrame>
      <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-(--bottom-bar-height) web:pb-[calc(var(--bottom-bar-height)+var(--floating-banner-offset,0px))]'>
      <div className='px-x4 shrink-0 pt-6'>
        <GuardianKindergartenHomeSegment />
      </div>
      <div className='px-x4 flex flex-1 flex-col items-center justify-center gap-5 text-center'>
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
        <div className='flex w-full flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{guardianKindergartenPendingContent.title}</p>
          <p className='body1-regular text-text-tertiary'>
            {guardianKindergartenPendingContent.descriptionLines.map((line) => (
              <span key={line} className='block'>
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className='px-x4 pb-5'>
        <GuardianLinkedKindergartenCard kindergarten={kindergarten} />
      </div>
    </div>
    </GuardianDiarySegmentFrame>
  );
}

export { GuardianKindergartenPendingState };
