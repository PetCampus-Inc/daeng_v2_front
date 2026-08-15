'use client';

import { useState } from 'react';
import { ActionButton } from '@knockdog/ui';

import { BottomSheet } from '@shared/ui/bottom-sheet';
import type { GuardianConnectionApplyItem } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import { GuardianConnectionApplyPetSummary } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyPetSummary';

interface GuardianConnectionApplyCancelSheetProps {
  isOpen: boolean;
  close: () => void;
  item: GuardianConnectionApplyItem;
  onConfirm: () => Promise<void>;
}

function GuardianConnectionApplyCancelSheet({
  isOpen,
  close,
  item,
  onConfirm,
}: GuardianConnectionApplyCancelSheetProps) {
  const { cancelSheet } = guardianConnectionApplyStatusContent;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) close();
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      close();
    } catch {
      close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange} dismissible={!isSubmitting}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>{cancelSheet.title}</BottomSheet.Title>
        </BottomSheet.Header>

        <BottomSheet.Content className='px-4 pt-6 pb-5'>
          <div className='bg-bg-0 border-line-100 radius-r4 flex w-full flex-col border border-solid p-4'>
            <GuardianConnectionApplyPetSummary item={item} />
          </div>
        </BottomSheet.Content>

        <div className='grid w-full grid-cols-2 gap-2 p-5 pb-[max(1.25rem,var(--safe-area-inset-bottom,0px))]'>
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='large'
            disabled={isSubmitting}
            onClick={close}
          >
            {cancelSheet.closeLabel}
          </ActionButton>
          <ActionButton
            type='button'
            variant='primaryFill'
            size='large'
            disabled={isSubmitting}
            onClick={() => void handleConfirm()}
          >
            {cancelSheet.confirmLabel}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianConnectionApplyCancelSheet };
