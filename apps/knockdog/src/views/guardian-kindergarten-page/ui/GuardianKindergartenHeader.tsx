'use client';

import { Icon } from '@knockdog/ui';

import { guardianKindergartenEmptyContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenEmptyContent';
import { guardianKindergartenPendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenPendingContent';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

import { usePetRepresentativeQuery } from '@entities/pet';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';

interface GuardianKindergartenHeaderProps {
  status: GuardianKindergartenConnectionStatus;
}

function GuardianKindergartenHeader({ status }: GuardianKindergartenHeaderProps) {
  const { data: representativePet } = usePetRepresentativeQuery();

  const petName = representativePet?.name ?? '';
  const petImageUrl = representativePet?.profileImage;
  const headerStatus =
    status === 'pending'
      ? guardianKindergartenPendingContent.headerStatus
      : guardianKindergartenEmptyContent.headerStatus;

  return (
    <div className='relative pt-(--safe-area-inset-top,0px)'>
      <div className='px-x4 flex items-start justify-between py-5'>
        <div className='gap-x4 flex items-center'>
          <DogProfileAvatar name={petName || '강아지'} imageUrl={petImageUrl} className='size-[52px]' />

          <div className='gap-x1 flex flex-col items-start justify-center'>
            <div className='gap-x1 flex items-center'>
              <span className='h3-extrabold text-text-primary-inverse'>{petName}</span>
              <Icon icon='ChevronBottom' className='text-text-primary-inverse size-6' aria-hidden='true' />
            </div>
            <p className='body2-bold text-text-primary-inverse'>{headerStatus}</p>
          </div>
        </div>

        <div className='bg-bg-0 shrink-0 rounded-full p-1.5' aria-hidden='true'>
          <Icon icon='AlarmNone' className='text-fill-primary-500 size-6' />
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenHeader };
