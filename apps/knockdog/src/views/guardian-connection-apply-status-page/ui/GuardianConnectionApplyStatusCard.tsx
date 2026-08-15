'use client';

import { ActionButton, Icon } from '@knockdog/ui';

import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import {
  GUARDIAN_CONNECTION_APPLY_GENDER,
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import {
  formatApplyRequestedAt,
  truncateKindergartenName,
} from '@views/guardian-connection-apply-status-page/lib/formatApplyStatus';
import { GuardianConnectionApplyStatusBadge } from '@views/guardian-connection-apply-status-page/ui/badges';

interface GuardianConnectionApplyStatusCardProps {
  item: GuardianConnectionApplyItem;
  onCancel?: (id: string) => void;
}

function GuardianConnectionApplyStatusCard({ item, onCancel }: GuardianConnectionApplyStatusCardProps) {
  const content = guardianConnectionApplyStatusContent;
  const isPending = item.status === GUARDIAN_CONNECTION_APPLY_STATUS.PENDING;
  const genderIcon = item.pet.gender === GUARDIAN_CONNECTION_APPLY_GENDER.MALE ? 'Male' : 'Female';

  return (
    <article className='bg-bg-0 border-line-100 radius-r4 flex w-full flex-col border border-solid p-4'>
      <div className='flex w-full flex-col gap-5'>
        <div className='flex w-full flex-col gap-3'>
          <div className='flex w-full items-center justify-between gap-2'>
            <GuardianConnectionApplyStatusBadge status={item.status} />
            <p className='label-medium text-text-tertiary min-w-0 flex-1 truncate text-right'>
              {formatApplyRequestedAt(item.appliedAt)}
            </p>
          </div>

          <div className='flex w-full items-center gap-3'>
            <DogProfileAvatar name={item.pet.name} imageUrl={item.pet.imageUrl} className='border-line-100' />
            <div className='flex min-w-0 flex-1 flex-col'>
              <div className='flex w-full items-center gap-1'>
                <p className='body1-medium text-text-primary shrink-0'>{item.pet.name}</p>
                <Icon icon={genderIcon} className='text-text-accent size-4 shrink-0' aria-hidden='true' />
                <p className='body2-regular text-text-secondary min-w-0 truncate'>{item.pet.breed}</p>
              </div>
              <p className='body2-regular text-text-primary truncate'>
                {truncateKindergartenName(item.kindergartenName)}
              </p>
            </div>
          </div>
        </div>

        {isPending ? (
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='medium'
            onClick={() => onCancel?.(item.id)}
          >
            {content.cancelButtonLabel}
          </ActionButton>
        ) : null}
      </div>
    </article>
  );
}

export { GuardianConnectionApplyStatusCard };
