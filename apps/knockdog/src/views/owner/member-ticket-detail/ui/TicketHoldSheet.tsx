'use client';

import { useState } from 'react';

import { ActionButton, BottomSheet, TicketValueField } from '@knockdog/ui';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';
import {
  canConfirmHold,
  formatHoldDotDate,
  startOfHoldDay,
} from '@views/owner/member-ticket-detail/model/memberTicketHold';

import { TicketHoldDateSheet } from '@views/owner/member-ticket-detail/ui/TicketHoldDateSheet';

import { useNativeBackToClose } from '@shared/lib/bridge';

type HoldDateTarget = 'start' | 'end';

interface TicketHoldSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (startsOn: string, endsOn: string) => void;
}

function HoldDateField({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <div className='flex flex-col gap-x4'>
      <p className='label-medium text-text-secondary px-x1'>{label}</p>
      <TicketValueField
        state={value ? 'filled' : 'placeholder'}
        value={value ?? undefined}
        placeholder={placeholder}
        onClick={onClick}
      />
    </div>
  );
}

function TicketHoldSheet({ isOpen, onOpenChange, onConfirm }: TicketHoldSheetProps) {
  const content = memberTicketDetailContent;
  const [startsOn, setStartsOn] = useState<Date | null>(null);
  const [endsOn, setEndsOn] = useState<Date | null>(null);
  const [dateField, setDateField] = useState<HoldDateTarget | null>(null);
  const [draft, setDraft] = useState(() => startOfHoldDay(new Date()));
  const [month, setMonth] = useState(() => startOfHoldDay(new Date()));

  const startLabel = startsOn ? formatHoldDotDate(startsOn) : null;
  const endLabel = endsOn ? formatHoldDotDate(endsOn) : null;
  const canConfirm = canConfirmHold(startLabel, endLabel);

  const clearDraft = () => {
    setStartsOn(null);
    setEndsOn(null);
    setDateField(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) clearDraft();
    onOpenChange(nextOpen);
  };

  useNativeBackToClose(isOpen && dateField === null, () => handleOpenChange(false));

  const handleOpenDate = (field: HoldDateTarget) => {
    const seed = startOfHoldDay((field === 'start' ? startsOn : endsOn) ?? new Date());
    setDraft(seed);
    setMonth(seed);
    setDateField(field);
  };

  const handleConfirmDate = () => {
    if (dateField === 'start') setStartsOn(draft);
    if (dateField === 'end') setEndsOn(draft);
    setDateField(null);
  };

  const handleConfirm = () => {
    if (!startLabel || !endLabel || !canConfirm) return;
    onConfirm(startLabel, endLabel);
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
            <BottomSheet.Title>{content.holdSheetTitle}</BottomSheet.Title>
            <BottomSheet.CloseButton />
          </BottomSheet.Header>
          <div className='flex flex-col gap-4 px-4 py-6'>
            <HoldDateField
              label={content.holdStart}
              value={startLabel}
              placeholder={content.holdDatePlaceholder}
              onClick={() => handleOpenDate('start')}
            />
            <HoldDateField
              label={content.holdEnd}
              value={endLabel}
              placeholder={content.holdDatePlaceholder}
              onClick={() => handleOpenDate('end')}
            />
            <p className='caption1-regular text-text-tertiary'>{content.holdHint}</p>
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
              {content.hold}
            </ActionButton>
          </div>
        </BottomSheet.Body>
      </BottomSheet.Root>
      <TicketHoldDateSheet
        isOpen={dateField !== null}
        title={dateField === 'end' ? content.endSheetTitle : content.startSheetTitle}
        draft={draft}
        month={month}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDateField(null);
        }}
        onDraftChange={setDraft}
        onMonthChange={setMonth}
        onConfirm={handleConfirmDate}
      />
    </>
  );
}

export { TicketHoldSheet };
