'use client';

import { ActionButton, BottomSheet, MonthlyCalendar } from '@knockdog/ui';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';
import { formatHoldSelectLabel } from '@views/owner/member-ticket-detail/model/memberTicketHold';

interface TicketHoldDateSheetProps {
  isOpen: boolean;
  title: string;
  draft: Date;
  month: Date;
  onOpenChange: (isOpen: boolean) => void;
  onDraftChange: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onConfirm: () => void;
}

function TicketHoldDateSheet({
  isOpen,
  title,
  draft,
  month,
  onOpenChange,
  onDraftChange,
  onMonthChange,
  onConfirm,
}: TicketHoldDateSheetProps) {
  const content = memberTicketDetailContent;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onOpenChange} handleOnly>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal flex max-h-[calc(100dvh-32px)] flex-col rounded-t-[20px]'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 h-[54px] shrink-0 border-b px-6 py-[14px]'>
          <BottomSheet.Title>{title}</BottomSheet.Title>
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
            {content.selectDate(formatHoldSelectLabel(draft))}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { TicketHoldDateSheet };
