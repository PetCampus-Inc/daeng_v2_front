'use client';

import { overlay } from 'overlay-kit';

import { formatDateKey } from '@shared/lib/calendar-date';
import { toast } from '@shared/ui/toast';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { GuardianConnectionDisconnectDialog } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionDisconnectDialog';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';

interface UseGuardianConnectionDisconnectOptions {
  kindergartenName: string;
  /** UI-only 성공 시 호출 — 카드 과거 이력 전환용 */
  onDisconnected: (disconnectedAt: string) => void;
}

/**
 * 보호자 연결 해제 UI 플로우.
 * TODO: `POST member/dog/school` 등 보호자 disconnect API 준비되면 mutate 연동.
 * 지금은 API 없이 모달/토스트/카드 상태만 처리함.
 */
function useGuardianConnectionDisconnect({
  kindergartenName,
  onDisconnected,
}: UseGuardianConnectionDisconnectOptions) {
  const content = guardianConnectionHistoryContent;
  const { selectedPet, checkInAt, refetchHome, isHomeReady } = useGuardianKindergartenHome();

  const petName = selectedPet?.name?.trim() || '강아지';

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
    // UI-only: 로딩 오버레이 체감용 짧은 딜레이
    await new Promise((resolve) => setTimeout(resolve, 400));

    const disconnectedAt = formatDateKey(new Date());
    onDisconnected(disconnectedAt);
    showSuccessToast();
    return true;
  };

  const handleDisconnectClick = async () => {
    if (!isHomeReady) return;

    // 당일 등원 기록 있으면 모달 없이 차단 토스트
    const homeResult = await refetchHome();
    const hasTodayAttendance = Boolean(homeResult.data?.checkInAt ?? checkInAt);
    if (hasTodayAttendance) {
      toast({ title: content.disconnectBlockedToast });
      return;
    }

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
    isDisconnecting: !isHomeReady,
  };
}

export { useGuardianConnectionDisconnect };
