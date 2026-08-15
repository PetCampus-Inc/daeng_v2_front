'use client';

import { ActionButton } from '@knockdog/ui';

import {
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import {
  formatApplyRequestedAt,
} from '@views/guardian-connection-apply-status-page/lib/formatApplyStatus';
import { GuardianConnectionApplyStatusBadge } from '@views/guardian-connection-apply-status-page/ui/badges';
import { GuardianConnectionApplyPetSummary } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyPetSummary';

interface GuardianConnectionApplyStatusCardProps {
  item: GuardianConnectionApplyItem;
  onCancelClick?: (item: GuardianConnectionApplyItem) => void;
}

function GuardianConnectionApplyStatusCard({ item, onCancelClick }: GuardianConnectionApplyStatusCardProps) {
  const content = guardianConnectionApplyStatusContent;
  const isPending = item.status === GUARDIAN_CONNECTION_APPLY_STATUS.PENDING;

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

          <GuardianConnectionApplyPetSummary item={item} />
        </div>

        {isPending ? (
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='medium'
            onClick={() => onCancelClick?.(item)}
          >
            {content.cancelButtonLabel}
          </ActionButton>
        ) : null}
      </div>
    </article>
  );
}

export { GuardianConnectionApplyStatusCard };
