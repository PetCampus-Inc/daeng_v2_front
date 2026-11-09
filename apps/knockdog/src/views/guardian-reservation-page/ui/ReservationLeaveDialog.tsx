'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { RESERVATION_CONFIRM_COPY } from '@views/guardian-reservation-page/config/guardianReservationConfirm';

interface ReservationLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
}

function ReservationLeaveDialog({ isOpen, onClose, onLeave }: ReservationLeaveDialogProps) {
  const copy = RESERVATION_CONFIRM_COPY;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.leaveTitle}</AlertDialogTitle>
          <AlertDialogDescription>{copy.leaveBody}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{copy.stay}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onLeave();
            }}
          >
            {copy.leave}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ReservationLeaveDialog };
