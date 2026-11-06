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

import { ellipsisText } from '@shared/utils';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';

interface OwnerMemberProfileDisconnectDialogProps {
  isOpen: boolean;
  dogName: string;
  close: () => void;
  /** failed → 프로필 복귀 / completed → 구성원 탭 이동 등 후처리 완료 */
  onDisconnect: () => Promise<'failed' | 'completed'>;
}

function OwnerMemberProfileDisconnectDialog({
  isOpen,
  dogName,
  close,
  onDisconnect,
}: OwnerMemberProfileDisconnectDialogProps) {
  const { disconnectDialog } = ownerMemberProfileContent;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayDogName = ellipsisText(dogName, disconnectDialog.nameMaxLength);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) close();
  };

  const handleDisconnect = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 성공·실패 모두 모달을 닫아 프로필(또는 이동된 구성원 탭)로 복귀
      await onDisconnect();
      close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange} closeOnNativeBack={false}>
      <AlertDialogContent className='max-w-[358px]'>
        <AlertDialogHeader className='px-x4'>
          <AlertDialogTitle>
            <span className='text-text-accent'>{displayDogName}</span>
            {disconnectDialog.titleSuffix}
            <br />
            {disconnectDialog.titleLine2}
          </AlertDialogTitle>
          <AlertDialogDescription className='whitespace-pre-line'>
            {disconnectDialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='px-x4'>
          <AlertDialogCancel disabled={isSubmitting} className='body1-bold text-text-secondary'>
            {disconnectDialog.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className='body1-bold text-text-primary-inverse'
            onClick={(event) => {
              event.preventDefault();
              void handleDisconnect();
            }}
          >
            {disconnectDialog.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { OwnerMemberProfileDisconnectDialog };
