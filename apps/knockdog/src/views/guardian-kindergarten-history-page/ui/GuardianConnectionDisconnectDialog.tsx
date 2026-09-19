'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';
import { ellipsisText } from '@shared/utils';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

interface GuardianConnectionDisconnectDialogProps {
  isOpen: boolean;
  kindergartenName: string;
  petName: string;
  close: () => void;
  onDisconnect: () => Promise<boolean>;
}

function GuardianConnectionDisconnectDialog({
  isOpen,
  kindergartenName,
  petName,
  close,
  onDisconnect,
}: GuardianConnectionDisconnectDialogProps) {
  const { disconnectDialog } = guardianConnectionHistoryContent;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayKindergartenName = ellipsisText(
    kindergartenName,
    disconnectDialog.nameMaxLength
  );

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) close();
  };

  const handleDisconnect = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onDisconnect();
      if (success) close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className='max-w-[358px]'>
        {/* relative는 Content에 두면 fixed 중앙 정렬을 덮어씀 */}
        <div className='relative'>
          <ActionLoadingOverlay isPending={isSubmitting} />
          <AlertDialogHeader className='px-x4'>
            <AlertDialogTitle>
              <span className='text-text-accent'>{displayKindergartenName}</span>
              {disconnectDialog.titleSuffix}
            </AlertDialogTitle>
            <AlertDialogDescription className='whitespace-pre-line'>
              {disconnectDialog.descriptionPrefix}
              {petName}
              {disconnectDialog.descriptionSuffix}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='px-x4'>
            <AlertDialogCancel disabled={isSubmitting}>{disconnectDialog.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                void handleDisconnect();
              }}
            >
              {disconnectDialog.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { GuardianConnectionDisconnectDialog };
