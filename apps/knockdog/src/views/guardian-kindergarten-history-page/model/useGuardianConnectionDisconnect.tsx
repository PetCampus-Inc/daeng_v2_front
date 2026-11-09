'use client';

import { overlay } from 'overlay-kit';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { GuardianConnectionDisconnectDialog } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionDisconnectDialog';

import { useGuardianSchoolDisconnectMutation } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { ApiError } from '@shared/api';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { formatDateKey } from '@shared/lib/calendar-date';
import { toast } from '@shared/ui/toast';

interface UseGuardianConnectionDisconnectOptions {
  kindergartenName: string;
  petName: string;
  schoolPetMembershipId: string | null;
  /** 성공 시 카드 과거 이력 전환용. 목록 재조회 전 즉시 반영 */
  onDisconnected: (disconnectedAt: string) => void;
}

function isTodayAttendanceBlockedError(error: unknown) {
  return error instanceof ApiError && error.message.includes('등원');
}

/**
 * 보호자 연결 해제.
 * `DELETE /api/v0/guardian/school/connections/{schoolPetMembershipId}`
 */
function useGuardianConnectionDisconnect({
  kindergartenName,
  petName,
  schoolPetMembershipId,
  onDisconnected,
}: UseGuardianConnectionDisconnectOptions) {
  const content = guardianConnectionHistoryContent;
  const userId = useUserStore((state) => state.user?.userId);
  const disconnectMutation = useGuardianSchoolDisconnectMutation({ userId });

  const showSuccessToast = () => {
    toast({
      type: 'success',
      nativeTitle: `${kindergartenName}${content.disconnectSuccessToastSuffix}`,
      titleParts: [
        { text: kindergartenName, accent: true },
        { text: content.disconnectSuccessToastSuffix },
      ],
      title: (
        <>
          <span className='text-text-accent'>{kindergartenName}</span>
          <span className='text-text-primary-inverse'>{content.disconnectSuccessToastSuffix}</span>
        </>
      ),
    });
  };

  const disconnectAndNotify = async () => {
    if (!schoolPetMembershipId) {
      toast({ title: content.disconnectFailToast });
      return false;
    }

    try {
      await disconnectMutation.mutateAsync({ schoolPetMembershipId });
    } catch (error) {
      toast({
        title: isTodayAttendanceBlockedError(error)
          ? content.disconnectBlockedToast
          : content.disconnectFailToast,
      });
      return isTodayAttendanceBlockedError(error);
    }

    onDisconnected(formatDateKey(new Date()));
    trackConnectionStatus({
      status: 'disconnect',
      initiated_by: 'guardian',
      school_pet_membership_id: schoolPetMembershipId,
      reason: 'manual',
    });
    showSuccessToast();
    return true;
  };

  const handleDisconnectClick = () => {
    if (disconnectMutation.isPending) return;

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
