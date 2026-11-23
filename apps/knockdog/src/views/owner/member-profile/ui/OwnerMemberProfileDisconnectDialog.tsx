'use client';

import { getDogNameSuffix } from '@knockdog/ui/lib';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { ellipsisText } from '@shared/utils';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';

interface OwnerMemberProfileDisconnectDialogProps {
  isOpen: boolean;
  dogName: string;
  close: () => void;
  /** 확인창이 닫힌 뒤 연결 해제를 시작한다 */
  onDisconnect: () => void | Promise<void>;
}

/** 원생 연결 해제 확인 웹 모달. 확인을 누르면 모달이 바로 닫히고 해제가 시작된다. */
function OwnerMemberProfileDisconnectDialog({
  isOpen,
  dogName,
  close,
  onDisconnect,
}: OwnerMemberProfileDisconnectDialogProps) {
  const { disconnectDialog } = ownerMemberProfileContent;
  const displayDogName = ellipsisText(dogName, disconnectDialog.nameMaxLength);

  const handleDisconnect = () => {
    close();
    void onDisconnect();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={
        <>
          <span className='text-text-accent'>{displayDogName}</span>
          {getDogNameSuffix(dogName, '의')}
          {disconnectDialog.titleSuffix}
        </>
      }
      description={disconnectDialog.description}
      cancelLabel={disconnectDialog.cancelLabel}
      confirmLabel={disconnectDialog.confirmLabel}
      onClose={close}
      onConfirm={handleDisconnect}
    />
  );
}

export { OwnerMemberProfileDisconnectDialog };
