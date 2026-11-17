'use client';

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
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

interface GuardianConnectionDisconnectDialogProps {
  isOpen: boolean;
  kindergartenName: string;
  petName: string;
  close: () => void;
  /** 모달을 닫은 뒤 해제 조건 검사와 해제를 진행한다 */
  onDisconnect: () => void;
}

function GuardianConnectionDisconnectDialog({
  isOpen,
  kindergartenName,
  petName,
  close,
  onDisconnect,
}: GuardianConnectionDisconnectDialogProps) {
  const { disconnectDialog } = guardianConnectionHistoryContent;
  const displayKindergartenName = ellipsisText(
    kindergartenName,
    disconnectDialog.nameMaxLength
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const handleDisconnect = () => {
    close();
    onDisconnect();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange} closeOnNativeBack={false}>
      <AlertDialogContent className='max-w-[358px]'>
        {/* relative는 Content에 두면 fixed 중앙 정렬을 덮어씀 */}
        <div className='relative'>
          <AlertDialogHeader className='px-x4'>
            <AlertDialogTitle className='whitespace-pre-line'>
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
            <AlertDialogCancel className='body1-bold text-text-secondary'>
              {disconnectDialog.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              className='body1-bold text-text-primary-inverse'
              onClick={(event) => {
                event.preventDefault();
                handleDisconnect();
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
