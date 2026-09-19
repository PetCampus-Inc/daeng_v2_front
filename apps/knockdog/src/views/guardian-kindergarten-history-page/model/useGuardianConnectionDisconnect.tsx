'use client';

import { overlay } from 'overlay-kit';

import { useGuardianSchoolDisconnectMutation } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { toast } from '@shared/ui/toast';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { GuardianConnectionDisconnectDialog } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionDisconnectDialog';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

interface UseGuardianConnectionDisconnectOptions {
  kindergartenName: string;
}

function useGuardianConnectionDisconnect({ kindergartenName }: UseGuardianConnectionDisconnectOptions) {
  const content = guardianConnectionHistoryContent;
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

  const handleDisconnectClick = () => {
    // OverlayProvider history trap — 시스템/브라우저 뒤로가기는 모달만 닫음
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

  return {
    handleDisconnectClick,
    isDisconnecting: disconnectMutation.isPending,
  };
}

export { useGuardianConnectionDisconnect };
