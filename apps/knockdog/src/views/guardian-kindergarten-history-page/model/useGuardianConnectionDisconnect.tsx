'use client';

import { useState } from 'react';
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
import { ApiError } from '@shared/api';
import { trackConnectionStatus } from '@shared/lib/analytics';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey } from '@shared/lib/calendar-date';
import { toast } from '@shared/ui/toast';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import {
  toReservationScheduleLabel,
  toTicketExpiryLabel,
} from '@views/guardian-kindergarten-history-page/lib/formatGuardianDisconnectBlock';
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
  onDisconnected: (disconnectedAt: string) => void;
}

function isTodayAttendanceBlockedError(error: unknown) {
  return error instanceof ApiError && error.message.includes('등원');
}

/**
 * 보호자 연결 해제.
 * 확인 모달에서 `연결 해제하기`를 누르면 모달을 닫고 해제 가능 여부를 조회한 뒤,
 * 결과에 따라 해제 / 해제 불가 시트 / 당일 등원 토스트로 나눈다.
 */
function useGuardianConnectionDisconnect({
  kindergartenName,
  petName,
  placeId,
  schoolPetMembershipId,
  onDisconnected,
}: UseGuardianConnectionDisconnectOptions) {
  const content = guardianConnectionHistoryContent;
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const disconnectMutation = useGuardianSchoolDisconnectMutation({ userId });
  const [isChecking, setIsChecking] = useState(false);

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

  const openBlockedSheet = (body: string, tickets: DisconnectTicketProps[]) => {
    overlay.open(({ isOpen, close }) => (
      <GuardianDisconnectBlockedSheet
        isOpen={isOpen}
        body={body}
        tickets={tickets}
        onConfirm={close}
        onInquiry={() => {
          close();
          if (placeId && isKindergartenId(placeId)) push({ pathname: `/kindergarten/${placeId}` });
        }}
      />
    ));
  };

  const openBlockedSheetFor = (eligibility: GuardianDisconnectEligibility, judgement: string) => {
    const { blockedSheet } = content;

    if (judgement === GUARDIAN_DISCONNECT_JUDGEMENT.tickets) {
      openBlockedSheet(
        blockedSheet.ticketsBody,
        eligibility.tickets.map((ticket) => ({
          kind: 'pass',
          title: ticket.name,
          description: toTicketExpiryLabel(ticket.expiresOn),
          amount: `${ticket.remainingCount}${blockedSheet.ticketRemainingSuffix}`,
        }))
      );
      return;
    }

    if (eligibility.reservation) {
      openBlockedSheet(blockedSheet.reservationBody, [
        {
          kind: 'reservation',
          title: `${kindergartenName}${blockedSheet.reservationTitleSuffix}`,
          description: toReservationScheduleLabel(eligibility.reservation.date, eligibility.reservation.time),
          amount: blockedSheet.reservationStatus,
        },
      ]);
    }
  };

  const disconnect = async (membershipId: string) => {
    try {
      await disconnectMutation.mutateAsync({ schoolPetMembershipId: membershipId });
    } catch (error) {
      toast({
        title: isTodayAttendanceBlockedError(error) ? content.disconnectBlockedToast : content.disconnectFailToast,
      });
      return;
    }

    onDisconnected(formatDateKey(new Date()));
    trackConnectionStatus({
      status: 'disconnect',
      initiated_by: 'guardian',
      school_pet_membership_id: membershipId,
      reason: 'manual',
    });
    showSuccessToast();
  };

  const checkAndDisconnect = async () => {
    if (!schoolPetMembershipId) {
      toast({ title: content.disconnectFailToast });
      return;
    }

    setIsChecking(true);
    try {
      const eligibility = toDisconnectEligibility(
        await getDisconnectEligibility({ schoolPetMembershipId })
      );
      const judgement = judgeGuardianDisconnect(eligibility);

      if (judgement === GUARDIAN_DISCONNECT_JUDGEMENT.todayAttendance) {
        toast({ title: content.disconnectBlockedToast });
      } else if (judgement === GUARDIAN_DISCONNECT_JUDGEMENT.proceed) {
        await disconnect(schoolPetMembershipId);
      } else {
        openBlockedSheetFor(eligibility, judgement);
      }
    } catch {
      toast({ title: content.disconnectFailToast });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDisconnectClick = () => {
    if (isChecking || disconnectMutation.isPending) return;

    overlay.open(({ isOpen, close }) => (
      <GuardianConnectionDisconnectDialog
        isOpen={isOpen}
        kindergartenName={kindergartenName}
        petName={petName}
        close={close}
        onDisconnect={checkAndDisconnect}
      />
    ));
  };

  return {
    handleDisconnectClick,
    isDisconnecting: isChecking || disconnectMutation.isPending,
  };
}

export { useGuardianConnectionDisconnect };
