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

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';

interface TicketConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

function TicketConfirmDialog({ isOpen, title, description, confirmLabel, onClose, onConfirm }: TicketConfirmDialogProps) {
  const content = memberTicketDetailContent;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader className='px-x4'>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='px-x4'>
          <AlertDialogCancel className='body1-bold text-text-secondary'>{content.close}</AlertDialogCancel>
          <AlertDialogAction
            className='body1-bold text-text-primary-inverse'
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { TicketConfirmDialog };
