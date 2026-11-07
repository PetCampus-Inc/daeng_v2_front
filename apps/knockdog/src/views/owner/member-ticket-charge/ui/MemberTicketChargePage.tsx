'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  ActionButton,
  CustomDurationChip,
  DurationChip,
  DurationUnitField,
  FormField,
  TicketValueField,
} from '@knockdog/ui';

import { memberTicketChargeContent } from '@views/owner/member-ticket-charge/config/memberTicketChargeContent';
import {
  MONTH_PRESETS,
  canChargeTicket,
  chargeCountError,
  chargeEndDate,
  formatChargeDotDate,
  isSameChargeDay,
  startOfChargeDay,
  type ChargeDuration,
  type ChargeMonth,
  type ChargeUnit,
} from '@views/owner/member-ticket-charge/model/memberTicketCharge';
import { TicketChargeDateSheet } from '@views/owner/member-ticket-charge/ui/TicketChargeDateSheet';
import { TicketChargeLeaveDialog } from '@views/owner/member-ticket-charge/ui/TicketChargeLeaveDialog';
import { Header } from '@widgets/Header';

import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { toast } from '@shared/ui/toast';

type DurationChoice = 'none' | 'custom' | ChargeMonth | null;

function toChargeDuration(choice: DurationChoice, amountText: string, unit: ChargeUnit): ChargeDuration | null {
  if (choice === null) return null;
  if (choice === 'none') return { kind: 'none' };
  if (choice === 'custom') {
    const amount = Number(amountText);
    return { kind: 'custom', amount: Number.isFinite(amount) ? amount : 0, unit };
  }
  return { kind: 'month', months: choice };
}

function MemberTicketChargePage() {
  const content = memberTicketChargeContent;
  const { back } = useStackNavigation();
  const handleBackRef = useRef(() => {});
  const [today] = useState(() => startOfChargeDay(new Date()));
  const [startDate, setStartDate] = useState(today);
  const [draftDate, setDraftDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [name, setName] = useState('');
  const [count, setCount] = useState('');
  const [hasCountBlurred, setHasCountBlurred] = useState(false);
  const [choice, setChoice] = useState<DurationChoice>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [unit, setUnit] = useState<ChargeUnit>('month');
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const duration = toChargeDuration(choice, customAmount, unit);
  const countError = hasCountBlurred ? chargeCountError(count) : null;
  const canSubmit = canChargeTicket(name, count, duration) && !isSubmitting;
  const endDate = duration ? chargeEndDate(startDate, duration) : null;
  const isDirty = name !== '' || count !== '' || choice !== null || customAmount !== '' || !isSameChargeDay(startDate, today);

  const { releaseAndLeave } = useUnsavedBrowserBackGuard(isDirty, () => {
    handleBackRef.current();
  });

  const handleOpenDate = () => {
    setDraftDate(startDate);
    setCalendarMonth(startDate);
    setIsDateOpen(true);
  };

  const handleConfirmDate = () => {
    setStartDate(draftDate);
    setIsDateOpen(false);
  };

  const handleBack = useCallback(() => {
    if (isDateOpen) {
      setIsDateOpen(false);
      return;
    }
    if (isLeaveOpen) {
      setIsLeaveOpen(false);
      return;
    }
    if (!isDirty) {
      releaseAndLeave(back);
      return;
    }
    setIsLeaveOpen(true);
  }, [back, isDateOpen, isDirty, isLeaveOpen, releaseAndLeave]);

  useLayoutEffect(() => {
    handleBackRef.current = handleBack;
  }, [handleBack]);
  useNativeBackHandler(handleBack);

  const handleLeave = () => {
    setIsLeaveOpen(false);
    releaseAndLeave(back);
  };

  const handleCharge = () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    toast({
      type: 'default',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: content.failure,
      title: content.failure,
    });
    setIsSubmitting(false);
  };

  return (
    <div className='flex h-full flex-col bg-white'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{content.title}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-5 pb-4'>
        <div className='flex flex-col gap-x4'>
          <p className='label-medium text-text-secondary px-x1'>{content.startDate.label}</p>
          <TicketValueField
            state='filled'
            value={formatChargeDotDate(startDate)}
            placeholder={content.startDate.placeholder}
            onClick={handleOpenDate}
          />
        </div>

        <div className='flex flex-col gap-x4'>
          <p className='label-medium text-text-secondary px-x1'>
            {content.preset.label} <span className='text-text-accent'>{content.preset.optional}</span>
          </p>
          <TicketValueField state='placeholder' placeholder={content.preset.placeholder} />
        </div>

        <FormField
          label={content.name.label}
          value={name}
          maxLength={content.name.maxLength}
          placeholder={content.name.placeholder}
          state={name ? 'filled' : 'default'}
          trailing={`${name.length}/${content.name.maxLength}`}
          onChange={(event) => setName(event.target.value)}
        />

        <FormField
          label={content.count.label}
          value={count}
          inputMode='numeric'
          placeholder={content.count.placeholder}
          state={countError ? 'error' : count ? 'filled' : 'default'}
          trailing={content.count.unit}
          trailingSize='body'
          errorMessage={countError}
          onBlur={() => setHasCountBlurred(true)}
          onChange={(event) => setCount(event.target.value.replace(/\D/g, '').slice(0, 4))}
        />

        <div className='flex flex-wrap justify-between gap-y-3'>
          <DurationChip selected={choice === 'none'} onClick={() => setChoice('none')}>
            {content.duration.none}
          </DurationChip>
          {MONTH_PRESETS.map((months) => (
            <DurationChip key={months} selected={choice === months} onClick={() => setChoice(months)}>
              {content.duration.month(months)}
            </DurationChip>
          ))}
          <CustomDurationChip selected={choice === 'custom'} onClick={() => setChoice('custom')}>
            {content.duration.custom}
          </CustomDurationChip>
        </div>

        {choice === 'custom' ? (
          <DurationUnitField
            unit={unit}
            value={customAmount}
            inputMode='numeric'
            onUnitChange={setUnit}
            onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        ) : null}

        {endDate ? (
          <p className='caption1-regular text-fill-secondary-500 px-x1'>
            {content.duration.hint(formatChargeDotDate(startDate), formatChargeDotDate(endDate))}
          </p>
        ) : null}
      </div>

      <div className='shrink-0 bg-white px-4 py-4'>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='body1-bold'
          disabled={!canSubmit}
          onClick={handleCharge}
        >
          {content.submit}
        </ActionButton>
      </div>

      <TicketChargeDateSheet
        isOpen={isDateOpen}
        draft={draftDate}
        month={calendarMonth}
        onOpenChange={setIsDateOpen}
        onDraftChange={setDraftDate}
        onMonthChange={setCalendarMonth}
        onConfirm={handleConfirmDate}
      />
      <TicketChargeLeaveDialog isOpen={isLeaveOpen} onStay={() => setIsLeaveOpen(false)} onLeave={handleLeave} />
    </div>
  );
}

export { MemberTicketChargePage };
