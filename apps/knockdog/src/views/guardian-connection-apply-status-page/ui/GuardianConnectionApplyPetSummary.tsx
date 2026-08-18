'use client';

import { Icon } from '@knockdog/ui';

import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import {
  GUARDIAN_CONNECTION_APPLY_GENDER,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { truncateKindergartenName } from '@views/guardian-connection-apply-status-page/lib/formatApplyStatus';

interface GuardianConnectionApplyPetSummaryProps {
  item: Pick<GuardianConnectionApplyItem, 'pet' | 'kindergartenName'>;
}

function GuardianConnectionApplyPetSummary({ item }: GuardianConnectionApplyPetSummaryProps) {
  const genderIcon =
    item.pet.gender === GUARDIAN_CONNECTION_APPLY_GENDER.MALE
      ? 'Male'
      : item.pet.gender === GUARDIAN_CONNECTION_APPLY_GENDER.FEMALE
        ? 'Female'
        : null;

  return (
    <div className='flex w-full items-center gap-3'>
      <DogProfileAvatar name={item.pet.name} imageUrl={item.pet.imageUrl} className='border-line-100' />
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex w-full items-center gap-1'>
          <p className='body1-medium text-text-primary shrink-0'>{item.pet.name}</p>
          {genderIcon ? (
            <Icon icon={genderIcon} className='text-text-accent size-4 shrink-0' aria-hidden='true' />
          ) : null}
          <p className='body2-regular text-text-secondary min-w-0 truncate'>{item.pet.breed}</p>
        </div>
        <p className='body2-regular text-text-primary truncate'>
          {truncateKindergartenName(item.kindergartenName)}
        </p>
      </div>
    </div>
  );
}

export { GuardianConnectionApplyPetSummary };
