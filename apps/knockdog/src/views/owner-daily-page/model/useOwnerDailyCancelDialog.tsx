import { getDogNameSuffix } from '@knockdog/ui/lib';

import { overlay } from 'overlay-kit';

import { OWNER_DAILY_CANCEL_CONTENT, type OwnerDailyCancelKind } from '@views/owner-daily-page/config/ownerDailyContent';
import { OwnerDailyCancelDialog } from '@views/owner-daily-page/ui/OwnerDailyCancelDialog';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

import { openConfirmDialog } from '@shared/lib/bridge';
import { ellipsisText } from '@shared/utils';

type CancelDialogMember = Pick<AttendanceCheckinoutCandidate, 'petId' | 'name'>;

interface UseOwnerDailyCancelDialogParams {
  onCancelCheckIn: (member: CancelDialogMember) => Promise<void>;
  onCancelAbsent: (member: CancelDialogMember) => Promise<void>;
  onCancelCheckOut: (member: CancelDialogMember) => Promise<void>;
}

/**
 * 등원·결석·하원 취소 확인창을 연다. 취소 버튼은 항상 먼저 이 확인창을 연다.
 * 네이티브 앱에서는 네이티브 확인창을 먼저 시도하고, 쓸 수 없으면 웹 모달(`OwnerDailyCancelDialog`)을 띄운다.
 * 확인창에서 `취소하기`를 누르면 확인창이 바로 닫히고 해당 취소 요청 함수를 부른다.
 */
const useOwnerDailyCancelDialog = ({
  onCancelCheckIn,
  onCancelAbsent,
  onCancelCheckOut,
}: UseOwnerDailyCancelDialogParams) => {
  const cancelHandlers: Record<OwnerDailyCancelKind, (member: CancelDialogMember) => Promise<void>> = {
    checkIn: onCancelCheckIn,
    absent: onCancelAbsent,
    checkOut: onCancelCheckOut,
  };

  /** 취소 확인창을 연다. */
  const openCancelDialog = async (kind: OwnerDailyCancelKind, member: CancelDialogMember) => {
    const { target, description } = OWNER_DAILY_CANCEL_CONTENT[kind];
    const displayName = ellipsisText(member.name, 8);
    const particle = getDogNameSuffix(member.name, '의');
    const result = await openConfirmDialog({
      title: `${displayName}${particle} ${target}을 취소할까요?`,
      titleParts: [{ text: displayName, accent: true }, { text: particle }, { text: ` ${target}을 취소할까요?` }],
      titleLineBreakAfterPartIndex: 1,
      description,
      cancelLabel: '닫기',
      confirmLabel: '취소하기',
    });

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void cancelHandlers[kind](member);
      return;
    }
    if (result.status === 'pending') return;

    overlay.open(({ isOpen, close }) => (
      <OwnerDailyCancelDialog
        kind={kind}
        member={member}
        open={isOpen}
        onOpenChange={close}
        onCancel={() => cancelHandlers[kind](member)}
      />
    ));
  };

  return { openCancelDialog };
};

export { useOwnerDailyCancelDialog };
