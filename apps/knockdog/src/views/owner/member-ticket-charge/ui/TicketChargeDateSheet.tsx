'use client';

import { ActionButton, BottomSheet, MonthlyCalendar } from '@knockdog/ui';

import { memberTicketChargeContent } from '@views/owner/member-ticket-charge/config/memberTicketChargeContent';
import { formatChargeSelectLabel } from '@views/owner/member-ticket-charge/model/memberTicketCharge';

interface TicketChargeDateSheetProps {
  isOpen: boolean;
  draft: Date;
  month: Date;
  onOpenChange: (isOpen: boolean) => void;
  onDraftChange: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onConfirm: () => void;
}

function TicketChargeDateSheet({
  isOpen,
  draft,
  month,
  onOpenChange,
  onDraftChange,
  onMonthChange,
  onConfirm,
}: TicketChargeDateSheetProps) {
  const { startDate } = memberTicketChargeContent;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onOpenChange} handleOnly>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal flex max-h-[calc(100dvh-32px)] flex-col rounded-t-[20px]'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 h-[54px] shrink-0 border-b px-6 py-[14px]'>
          <BottomSheet.Title>{startDate.sheetTitle}</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='px-5 py-5'>
          <MonthlyCalendar
            className='mx-auto'
            value={draft}
            month={month}
            onValueChange={onDraftChange}
            onMonthChange={onMonthChange}
          />
        </div>
        <div className='px-4 py-4'>
          <ActionButton type='button' variant='primaryFill' size='large' className='body1-bold' onClick={onConfirm}>
            {startDate.confirm(formatChargeSelectLabel(draft))}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { TicketChargeDateSheet };
