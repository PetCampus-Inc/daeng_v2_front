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

import { RESERVATION_DETAIL_COPY } from '@views/guardian-reservation-page/config/guardianReservationDetail';

interface ReservationCancelDialogProps {
  isOpen: boolean;
  whenLabel: string;
  summary: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ReservationCancelDialog({ isOpen, whenLabel, summary, onClose, onConfirm }: ReservationCancelDialogProps) {
  const copy = RESERVATION_DETAIL_COPY;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className='min-w-0 max-w-[min(326px,calc(100%-64px))]'>
        <AlertDialogHeader className='min-w-0'>
          <AlertDialogTitle>{copy.cancelTitle}</AlertDialogTitle>
          <AlertDialogDescription className='body2-regular min-w-0'>{copy.cancelBody}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className='bg-bg-50 radius-r2 mx-x5 mt-x5 p-x4 gap-x0_5 flex min-w-0 flex-col items-center text-center'>
          <p className='body1-medium text-text-primary'>{whenLabel}</p>
          <p className='body2-regular text-text-secondary'>{summary}</p>
        </div>
        <AlertDialogFooter className='min-w-0'>
          <AlertDialogCancel className='min-w-0 flex-1'>{copy.close}</AlertDialogCancel>
          <AlertDialogAction
            className='min-w-0 flex-1'
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {copy.cancel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ReservationCancelDialog };
