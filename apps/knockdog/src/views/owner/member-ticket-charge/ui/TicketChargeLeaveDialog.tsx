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

import { memberTicketChargeContent } from '@views/owner/member-ticket-charge/config/memberTicketChargeContent';

interface TicketChargeLeaveDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

function TicketChargeLeaveDialog({ isOpen, onStay, onLeave }: TicketChargeLeaveDialogProps) {
  const { leave } = memberTicketChargeContent;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onStay();
      }}
    >
      <AlertDialogContent className='max-w-[358px]'>
        <AlertDialogHeader className='px-x4'>
          <AlertDialogTitle>{leave.title}</AlertDialogTitle>
          <AlertDialogDescription>{leave.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='px-x4'>
          <AlertDialogCancel className='body1-bold text-text-secondary'>{leave.stay}</AlertDialogCancel>
          <AlertDialogAction
            className='body1-bold text-text-primary-inverse'
            onClick={(event) => {
              event.preventDefault();
              onLeave();
            }}
          >
            {leave.exit}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { TicketChargeLeaveDialog };
