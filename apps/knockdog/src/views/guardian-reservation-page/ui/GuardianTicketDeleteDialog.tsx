'use client';

import { ReservationAlertDialog } from '@views/guardian-reservation-page/ui/ReservationAlertDialog';

interface GuardianTicketDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function GuardianTicketDeleteDialog({ isOpen, onClose, onConfirm }: GuardianTicketDeleteDialogProps) {
  return (
    <ReservationAlertDialog
      isOpen={isOpen}
      title='이용권을 삭제할까요?'
      body={
        <>
          이용권 목록에서 사라지고
          <br />
          이용권 내역을 더 이상 볼 수 없어요.
        </>
      }
      cancelLabel='닫기'
      confirmLabel='삭제'
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

export { GuardianTicketDeleteDialog };
