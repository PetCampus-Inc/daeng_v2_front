'use client';

import { RESERVATION_DETAIL_COPY } from '@views/guardian-reservation-page/config/guardianReservationDetail';
import { ReservationAlertDialog } from '@views/guardian-reservation-page/ui/ReservationAlertDialog';

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
    <ReservationAlertDialog
      isOpen={isOpen}
      title={copy.cancelTitle}
      body={copy.cancelBody}
      cancelLabel={copy.close}
      confirmLabel={copy.cancel}
      contentClassName='min-w-0 max-w-[min(326px,calc(100%-64px))]'
      descriptionClassName='body2-regular min-w-0'
      actionClassName='min-w-0 flex-1'
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className='bg-bg-50 radius-r2 mx-x5 mt-x5 p-x4 gap-x0_5 flex min-w-0 flex-col items-center text-center'>
        <p className='body1-medium text-text-primary'>{whenLabel}</p>
        <p className='body2-regular text-text-secondary'>{summary}</p>
      </div>
    </ReservationAlertDialog>
  );
}

export { ReservationCancelDialog };
