'use client';

import { useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import type { DisconnectTicketProps } from '@knockdog/ui';

import {
  getDisconnectEligibility,
  toDisconnectEligibility,
  useGuardianSchoolDisconnectMutation,
  type GuardianDisconnectEligibility,
} from '@entities/guardian-home';
import { isKindergartenId } from '@entities/kindergarten';
import { useUserStore } from '@entities/user';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey } from '@shared/lib/calendar-date';
import { closeOverlayThenNavigate } from '@shared/lib/navigation/closeOverlayThenNavigate';
import { toast } from '@shared/ui/toast';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import {
  toReservationScheduleLabel,
  toTicketExpiryLabel,
} from '@views/guardian-kindergarten-history-page/lib/formatGuardianDisconnectBlock';
import {
  classifyGuardianDisconnectError,
  GUARDIAN_DISCONNECT_ERROR,
} from '@views/guardian-kindergarten-history-page/lib/classifyGuardianDisconnectError';
import {
  GUARDIAN_DISCONNECT_JUDGEMENT,
  judgeGuardianDisconnect,
} from '@views/guardian-kindergarten-history-page/lib/judgeGuardianDisconnect';
import { GuardianConnectionDisconnectDialog } from '@views/guardian-kindergarten-history-page/ui/GuardianConnectionDisconnectDialog';
import { GuardianDisconnectBlockedSheet } from '@views/guardian-kindergarten-history-page/ui/GuardianDisconnectBlockedSheet';

interface UseGuardianConnectionDisconnectOptions {
  kindergartenName: string;
  petName: string;
  /** 유치원 상세 페이지 경로용. 없으면 `유치원에 문의`가 이동하지 않는다 */
  placeId: string | null;
  schoolPetMembershipId: string | null;
  /** 성공 시 카드 과거 이력 전환용. 목록 재조회 전 즉시 반영 */
  onDisconnected?: (disconnectedAt: string) => void;
  /** 이미 해제된 연결(409)일 때 연결 이력을 다시 불러오는 함수 */
  onHistoryOutdated?: () => void;
}

/**
 * 보호자 연결 해제.
 * 가능 여부 조회 후 true이면 확인 다이얼로그를, false이면 사유 시트를 연다.
 */
function useGuardianConnectionDisconnect({
  kindergartenName,
  petName,
  placeId,
  schoolPetMembershipId,
  onDisconnected,
  onHistoryOutdated,
}: UseGuardianConnectionDisconnectOptions) {
  const content = guardianConnectionHistoryContent;
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const disconnectMutation = useGuardianSchoolDisconnectMutation({ userId });
  const [isChecking, setIsChecking] = useState(false);
  const isProcessing = useRef(false);

  const showSuccessToast = () => {
    toast({
      type: 'success',
      nativeTitle: `${kindergartenName}${content.disconnectSuccessToastSuffix}`,
      titleParts: [{ text: kindergartenName, bold: true }, { text: content.disconnectSuccessToastSuffix }],
      title: (
        <>
          <span className='body1-bold text-text-primary-inverse'>{kindergartenName}</span>
          <span className='text-text-primary-inverse'>{content.disconnectSuccessToastSuffix}</span>
        </>
      ),
    });
  };

  const openBlockedSheet = (body: string, tickets: DisconnectTicketProps[]) => {
    overlay.open(({ isOpen, close }) => (
      <GuardianDisconnectBlockedSheet
        isOpen={isOpen}
        body={body}
        tickets={tickets}
        onConfirm={close}
        onInquiry={() => {
          closeOverlayThenNavigate(close, () => {
            if (placeId && isKindergartenId(placeId)) {
              push({ pathname: `/kindergarten/${placeId}`, params: { entrySource: 'kindergarten-list' } });
            }
          });
        }}
      />
    ));
  };

  const openBlockedSheetFor = (eligibility: GuardianDisconnectEligibility) => {
    const { blockedSheet } = content;
    const bodies = [
      eligibility.tickets.length > 0 && blockedSheet.ticketsBody,
      eligibility.reservation && blockedSheet.reservationBody,
    ].filter(Boolean);
    const tickets: DisconnectTicketProps[] = eligibility.tickets.map((ticket) => ({
      kind: 'pass',
      title: ticket.name,
      description: toTicketExpiryLabel(ticket.expiresOn),
      amount: `${ticket.remainingCount}${blockedSheet.ticketRemainingSuffix}`,
    }));

    if (eligibility.reservation) {
      tickets.push({
        kind: 'reservation',
        title: `${kindergartenName}${blockedSheet.reservationTitleSuffix}`,
        description: toReservationScheduleLabel(eligibility.reservation.date, eligibility.reservation.time),
        amount: blockedSheet.reservationStatus,
      });
    }

    openBlockedSheet(bodies.join('\n\n') || blockedSheet.unknownBody, tickets);
  };

  /** 서버가 허용한 경우만 해제하고, 그 외에는 사유 시트를 연다. */
  const checkAndDisconnect = async () => {
    if (isProcessing.current) return;
    if (!schoolPetMembershipId) {
      toast({ title: content.disconnectFailToast });
      return;
    }

    isProcessing.current = true;
    setIsChecking(true);
    try {
      const eligibility = toDisconnectEligibility(await getDisconnectEligibility({ schoolPetMembershipId }));
      const judgement = judgeGuardianDisconnect(eligibility);

      if (judgement === GUARDIAN_DISCONNECT_JUDGEMENT.proceed) {
        overlay.open(({ isOpen, close }) => (
          <GuardianConnectionDisconnectDialog
            isOpen={isOpen}
            kindergartenName={kindergartenName}
            petName={petName}
            close={close}
            onDisconnect={() => {
              void confirmDisconnect(schoolPetMembershipId);
            }}
          />
        ));
      } else {
        openBlockedSheetFor(eligibility);
      }
    } catch {
      toast({ title: content.disconnectFailToast });
    } finally {
      isProcessing.current = false;
      setIsChecking(false);
    }
  };

  /** 이용권·예약이 남아 해제가 거절되면 조건을 다시 조회해 해제 불가 시트를 연다 */
  const recheckAfterRejection = async (membershipId: string) => {
    try {
      const eligibility = toDisconnectEligibility(
        await getDisconnectEligibility({ schoolPetMembershipId: membershipId })
      );
      if (!eligibility.canDisconnect) {
        openBlockedSheetFor(eligibility);
        return;
      }
    } catch {
      // 다시 조회하지 못하면 아래 실패 토스트로 알린다
    }
    toast({ title: content.disconnectFailToast });
  };

  const requestDisconnect = async (membershipId: string) => {
    try {
      await disconnectMutation.mutateAsync({ schoolPetMembershipId: membershipId });
    } catch (error) {
      const errorKind = classifyGuardianDisconnectError(error);

      if (errorKind === GUARDIAN_DISCONNECT_ERROR.ticketsOrReservationRemain) {
        await recheckAfterRejection(membershipId);
      } else if (errorKind === GUARDIAN_DISCONNECT_ERROR.alreadyDisconnected) {
        onHistoryOutdated?.();
      } else {
        toast({ title: content.disconnectFailToast });
      }
      return;
    }

    onDisconnected?.(formatDateKey(new Date()));
    trackConnectionStatus({
      status: 'disconnect',
      initiated_by: 'guardian',
      school_pet_membership_id: membershipId,
      reason: 'manual',
    });
    showSuccessToast();
  };

  const confirmDisconnect = async (membershipId: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setIsChecking(true);
    try {
      await requestDisconnect(membershipId);
    } finally {
      isProcessing.current = false;
      setIsChecking(false);
    }
  };

  const handleDisconnectClick = () => {
    void checkAndDisconnect();
  };

  return {
    handleDisconnectClick,
    isDisconnecting: isChecking || disconnectMutation.isPending,
  };
}

export { useGuardianConnectionDisconnect };
