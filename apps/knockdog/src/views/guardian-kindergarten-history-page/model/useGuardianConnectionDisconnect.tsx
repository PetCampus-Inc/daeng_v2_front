'use client';

import { overlay } from 'overlay-kit';

import { useGuardianSchoolDisconnectMutation } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { openConfirmDialog } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { ellipsisText } from '@shared/utils';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { GuardianConnectionDisconnectDialog } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionDisconnectDialog';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

interface UseGuardianConnectionDisconnectOptions {
  kindergartenName: string;
}

function useGuardianConnectionDisconnect({ kindergartenName }: UseGuardianConnectionDisconnectOptions) {
  const content = guardianConnectionHistoryContent;
  const { disconnectDialog } = content;
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPet } = useGuardianSelectedPet();
  const disconnectMutation = useGuardianSchoolDisconnectMutation({ userId });

  const petName = selectedPet?.name?.trim() || '강아지';

  const disconnectAndNotify = async () => {
    const dogId = selectedPet?.id ? String(selectedPet.id) : null;
    if (!dogId) {
      toast({ title: content.disconnectFailToast });
      return false;
    }

    try {
      await disconnectMutation.mutateAsync({ dogId });
      trackConnectionStatus({ status: 'disconnect', actor: 'guardian' });
      return true;
    } catch {
      toast({ title: content.disconnectFailToast });
      return false;
    }
  };

  const openWebDisconnectDialog = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianConnectionDisconnectDialog
        isOpen={isOpen}
        kindergartenName={kindergartenName}
        petName={petName}
        close={close}
        onDisconnect={disconnectAndNotify}
      />
    ));
  };

  const handleDisconnectClick = async () => {
    const displayName = ellipsisText(kindergartenName, disconnectDialog.nameMaxLength);

    const result = await openConfirmDialog({
      title: `${displayName}${disconnectDialog.titleSuffix}`,
      titleParts: [{ text: displayName, accent: true }, { text: disconnectDialog.titleSuffix }],
      description: `${disconnectDialog.descriptionPrefix}${petName}${disconnectDialog.descriptionSuffix}`,
      cancelLabel: disconnectDialog.cancelLabel,
      confirmLabel: disconnectDialog.confirmLabel,
      contentPaddingHorizontal: 16,
    });

    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void disconnectAndNotify();
      return;
    }

    openWebDisconnectDialog();
  };

  return {
    handleDisconnectClick,
    isDisconnecting: disconnectMutation.isPending,
  };
}

export { useGuardianConnectionDisconnect };
