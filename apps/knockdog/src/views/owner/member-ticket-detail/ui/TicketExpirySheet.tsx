'use client';

import { useState } from 'react';

import { ActionButton, BottomSheet, TicketValueField } from '@knockdog/ui';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';
import { dayAfterDotDate, formatTicketDotDate, startOfTicketDay } from '@views/owner/member-ticket-detail/model/memberTicketDate';
import { canExtendExpiry } from '@views/owner/member-ticket-detail/model/memberTicketExpiry';

import { TicketHoldDateSheet } from '@views/owner/member-ticket-detail/ui/TicketHoldDateSheet';

import { useNativeBackToClose } from '@shared/lib/bridge';

interface TicketExpirySheetProps {
  isOpen: boolean;
  currentEndsOn: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (endsOn: string) => void;
}

function TicketExpirySheet({ isOpen, currentEndsOn, onOpenChange, onConfirm }: TicketExpirySheetProps) {
  const content = memberTicketDetailContent;
  const [nextEndsOn, setNextEndsOn] = useState<Date | null>(null);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [draft, setDraft] = useState(() => startOfTicketDay(new Date()));
  const [month, setMonth] = useState(() => startOfTicketDay(new Date()));

  const nextLabel = nextEndsOn ? formatTicketDotDate(nextEndsOn) : null;
  const canConfirm = canExtendExpiry(currentEndsOn, nextLabel);
  const canConfirmDate = currentEndsOn != null && canExtendExpiry(currentEndsOn, formatTicketDotDate(draft));

  const clearDraft = () => {
    setNextEndsOn(null);
    setIsDateOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) clearDraft();
    onOpenChange(nextOpen);
  };

  useNativeBackToClose(isOpen && !isDateOpen, () => handleOpenChange(false));

  const handleOpenDate = () => {
    const seed = nextEndsOn ?? (currentEndsOn ? dayAfterDotDate(currentEndsOn) : startOfTicketDay(new Date()));
    setDraft(seed);
    setMonth(seed);
    setIsDateOpen(true);
  };

  const handleConfirmDate = () => {
    if (!canConfirmDate) return;
    setNextEndsOn(draft);
    setIsDateOpen(false);
  };

  const handleConfirm = () => {
    if (!nextLabel || !canConfirm) return;
    onConfirm(nextLabel);
    clearDraft();
    onOpenChange(false);
  };

  return (
    <>
      <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange} handleOnly>
        <BottomSheet.Overlay className='z-overlay' />
        <BottomSheet.Body className='z-modal flex max-h-[calc(100dvh-32px)] flex-col rounded-t-[20px]'>
          <BottomSheet.Handle />
          <BottomSheet.Header className='border-line-100 h-[54px] shrink-0 border-b px-6 py-[14px]'>
            <BottomSheet.Title>{content.expirySheetTitle}</BottomSheet.Title>
            <BottomSheet.CloseButton />
          </BottomSheet.Header>
          <div className='flex flex-col gap-4 px-4 py-6'>
            <div className='flex flex-col gap-x4'>
              <p className='label-medium text-text-secondary px-x1'>{content.expiresOn}</p>
              <TicketValueField
                state={nextLabel ? 'filled' : 'placeholder'}
                value={nextLabel ?? undefined}
                placeholder={content.holdDatePlaceholder}
                onClick={handleOpenDate}
              />
            </div>
            {currentEndsOn ? <p className='caption1-regular text-text-tertiary'>{content.expiryHint(currentEndsOn)}</p> : null}
          </div>
          <div className='px-4 pt-4 pb-[calc(1rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'>
            <ActionButton
              type='button'
              variant='primaryFill'
              size='large'
              className='body1-bold'
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {content.expiryConfirm}
            </ActionButton>
          </div>
        </BottomSheet.Body>
      </BottomSheet.Root>
      <TicketHoldDateSheet
        isOpen={isDateOpen}
        title={content.expiryDateTitle}
        draft={draft}
        month={month}
        isConfirmDisabled={!canConfirmDate}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setIsDateOpen(false);
        }}
        onDraftChange={setDraft}
        onMonthChange={setMonth}
        onConfirm={handleConfirmDate}
      />
    </>
  );
}

export { TicketExpirySheet };
