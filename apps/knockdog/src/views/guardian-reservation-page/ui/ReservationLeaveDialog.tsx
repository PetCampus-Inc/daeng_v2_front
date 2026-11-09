'use client';

import { RESERVATION_CONFIRM_COPY } from '@views/guardian-reservation-page/config/guardianReservationConfirm';
import { ReservationAlertDialog } from '@views/guardian-reservation-page/ui/ReservationAlertDialog';

interface ReservationLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
}

function ReservationLeaveDialog({ isOpen, onClose, onLeave }: ReservationLeaveDialogProps) {
  const copy = RESERVATION_CONFIRM_COPY;

  return (
    <ReservationAlertDialog
      isOpen={isOpen}
      title={copy.leaveTitle}
      body={copy.leaveBody}
      cancelLabel={copy.stay}
      confirmLabel={copy.leave}
      onClose={onClose}
      onConfirm={onLeave}
    />
  );
}

export { ReservationLeaveDialog };
