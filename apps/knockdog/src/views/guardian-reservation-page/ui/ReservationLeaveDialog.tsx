'use client';

import { RESERVATION_CONFIRM_COPY } from '@views/guardian-reservation-page/config/guardianReservationConfirm';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';

interface ReservationLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
}

/** 작성 중인 예약 메모를 두고 나갈 때 묻는 웹 확인창 */
function ReservationLeaveDialog({ isOpen, onClose, onLeave }: ReservationLeaveDialogProps) {
  const copy = RESERVATION_CONFIRM_COPY;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={copy.leaveTitle}
      description={copy.leaveBody}
      cancelLabel={copy.stay}
      confirmLabel={copy.leave}
      onClose={onClose}
      onConfirm={onLeave}
    />
  );
}

export { ReservationLeaveDialog };
