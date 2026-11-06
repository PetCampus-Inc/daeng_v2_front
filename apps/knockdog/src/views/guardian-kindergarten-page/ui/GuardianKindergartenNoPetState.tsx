'use client';

import Image from 'next/image';
import { ActionButton } from '@knockdog/ui';

import { guardianKindergartenNoPetContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenNoPetContent';
import { useStackNavigation } from '@shared/lib/bridge';

function GuardianKindergartenNoPetState() {
  const { push } = useStackNavigation();

  const handleRegisterClick = () => {
    push({ pathname: guardianKindergartenNoPetContent.petRegisterPath });
  };

  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col items-center justify-center gap-5 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image
            src={guardianKindergartenNoPetContent.imageSrc}
            alt={guardianKindergartenNoPetContent.imageAlt}
            fill
            className='object-contain'
            sizes='200px'
            priority
            unoptimized
          />
        </div>

        <div className='flex w-full flex-col items-center gap-5'>
          <div className='flex w-full flex-col items-center gap-1'>
            <p className='h2-extrabold text-text-primary'>{guardianKindergartenNoPetContent.title}</p>
            <p className='body1-regular text-text-primary whitespace-pre-line'>
              {guardianKindergartenNoPetContent.description}
            </p>
          </div>

          <ActionButton
            type='button'
            variant='primaryFill'
            size='large'
            className='w-full'
            onClick={handleRegisterClick}
          >
            {guardianKindergartenNoPetContent.ctaLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenNoPetState };
