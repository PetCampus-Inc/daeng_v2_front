'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

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
  canSelectChargePreset,
  chargeCountError,
  chargeEndDate,
  formatChargeDotDate,
  isSameChargeDay,
  startOfChargeDay,
  toChargePreset,
  toChargeTicketRequest,
  type ChargeDuration,
  type ChargeMonth,
  type ChargePreset,
  type ChargeUnit,
} from '@views/owner/member-ticket-charge/model/memberTicketCharge';
import { TicketChargeDateSheet } from '@views/owner/member-ticket-charge/ui/TicketChargeDateSheet';
import { TicketChargeLeaveDialog } from '@views/owner/member-ticket-charge/ui/TicketChargeLeaveDialog';
import { TicketChargePresetSheet } from '@views/owner/member-ticket-charge/ui/TicketChargePresetSheet';
import { Header } from '@widgets/Header';

import { useOwnerPassTemplatesQuery } from '@entities/owner-pass-template';
import { useChargePetTicketMutation } from '@entities/owner-pet-ticket';

import { getCurrentTxId, useNativeBackHandler, useNavigationResult, useStackNavigation } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { toast } from '@shared/ui/toast';

type DurationChoice = 'none' | 'custom' | ChargeMonth | null;

function choiceFromPreset(duration: ChargeDuration): DurationChoice {
  if (duration.kind === 'none') return 'none';
  if (duration.kind === 'month') return duration.months;
  return 'custom';
}

function blurActiveTextEntry() {
  const active = document.activeElement;
  if (!(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) return false;
  if (active.disabled || active.readOnly) return false;
  active.blur();
  return true;
}

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
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? '';
  const { back } = useStackNavigation();
  const { send } = useNavigationResult<boolean>();
  const chargeTicket = useChargePetTicketMutation(petId);
  const templatesQuery = useOwnerPassTemplatesQuery();
  const presets = (templatesQuery.data ?? []).map(toChargePreset);
  const handleBackRef = useRef(() => {});
  const chargeKeyRef = useRef<{ signature: string; idempotencyKey: string } | null>(null);
  const [today] = useState(() => startOfChargeDay(new Date()));
  const [startDate, setStartDate] = useState(today);
  const [draftDate, setDraftDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ChargePreset | null>(null);
  const [name, setName] = useState('');
  const [count, setCount] = useState('');
  const [hasCountBlurred, setHasCountBlurred] = useState(false);
  const [choice, setChoice] = useState<DurationChoice>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [unit, setUnit] = useState<ChargeUnit>('day');
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

  const handleSelectDirect = () => {
    setSelectedPreset(null);
    setName('');
    setCount('');
    setHasCountBlurred(false);
    setChoice(null);
    setCustomAmount('');
    setUnit('day');
    setIsPresetOpen(false);
  };

  const handleSelectPreset = (preset: ChargePreset) => {
    if (!canSelectChargePreset(preset)) {
      toast({
        type: 'default',
        shape: 'rounded',
        position: 'bottom',
        nativeTitle: content.preset.invalid,
        title: content.preset.invalid,
      });
      return;
    }

    setSelectedPreset(preset);
    setName(preset.name);
    setCount(String(preset.count));
    setChoice(choiceFromPreset(preset.duration));
    if (preset.duration.kind === 'custom') {
      setCustomAmount(String(preset.duration.amount));
      setUnit(preset.duration.unit);
    }
    setIsPresetOpen(false);
  };

  const handleBack = useCallback(() => {
    if (isDateOpen) {
      setIsDateOpen(false);
      return;
    }
    if (isPresetOpen) {
      setIsPresetOpen(false);
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
  }, [back, isDateOpen, isDirty, isLeaveOpen, isPresetOpen, releaseAndLeave]);

  const handleNativeBack = useCallback(() => {
    if (isDateOpen || isPresetOpen || isLeaveOpen) {
      handleBack();
      return;
    }
    // 앱 시스템 뒤로가기는 입력 중이면 키보드만 닫는다. 모달은 칸에서 빠진 뒤의 뒤로가기에서 연다.
    if (blurActiveTextEntry()) return;
    handleBack();
  }, [handleBack, isDateOpen, isLeaveOpen, isPresetOpen]);

  useLayoutEffect(() => {
    handleBackRef.current = handleBack;
  }, [handleBack]);
  useNativeBackHandler(handleNativeBack);

  const handleLeave = () => {
    setIsLeaveOpen(false);
    releaseAndLeave(back);
  };

  const showSuccessToast = () => {
    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: content.success,
      title: content.success,
    });
  };

  const showFailureToast = () => {
    toast({
      type: 'default',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: content.failure,
      title: content.failure,
    });
  };

  const handleCharge = () => {
    const body = toChargeTicketRequest(startDate, name, count, duration);
    if (!body || !petId || !canSubmit || isSubmitting) return;

    const signature = JSON.stringify(body);
    const previous = chargeKeyRef.current;
    const idempotencyKey = previous?.signature === signature ? previous.idempotencyKey : crypto.randomUUID();
    chargeKeyRef.current = { signature, idempotencyKey };
    setIsSubmitting(true);

    chargeTicket.mutate(
      { idempotencyKey, body },
      {
        onSuccess: () => {
          let hasShownSuccess = false;
          try {
            if (getCurrentTxId()) send(true);
            else {
              showSuccessToast();
              hasShownSuccess = true;
            }
          } catch {
            // 충전은 끝났고 화면 결과만 전달하지 못한 경우
          }

          const stayAfterCharge = () => {
            setIsSubmitting(false);
            if (hasShownSuccess) return;
            showSuccessToast();
            hasShownSuccess = true;
          };

          // popstate 안에서 바로 back() 하면 브라우저가 두 번째 이동을 버려서 가드만 빠진다
          releaseAndLeave(() => {
            requestAnimationFrame(() => {
              back()
                .then((wentBack) => {
                  if (!wentBack) stayAfterCharge();
                })
                .catch(stayAfterCharge);
            });
          });
        },
        onError: () => {
          setIsSubmitting(false);
          showFailureToast();
        },
      }
    );
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
            value={`${formatChargeDotDate(startDate)}${isSameChargeDay(startDate, today) ? ' (오늘)' : ''}`}
            placeholder={content.startDate.placeholder}
            onClick={handleOpenDate}
          />
        </div>

        <div className='flex flex-col gap-x4'>
          <p className='label-medium text-text-secondary px-x1'>
            {content.preset.label} <span className='text-text-accent'>{content.preset.optional}</span>
          </p>
          <TicketValueField
            state={selectedPreset ? 'filled' : 'placeholder'}
            value={selectedPreset?.name}
            placeholder={content.preset.placeholder}
            onClick={() => setIsPresetOpen(true)}
          />
          {selectedPreset ? (
            <p className='caption1-regular text-fill-secondary-500 px-x1'>{content.preset.lockHint}</p>
          ) : null}
        </div>

        <FormField
          label={content.name.label}
          value={name}
          maxLength={content.name.maxLength}
          placeholder={content.name.placeholder}
          state={selectedPreset ? 'locked' : name ? 'filled' : 'default'}
          trailing={`${name.length}/${content.name.maxLength}`}
          onChange={(event) => setName(event.target.value)}
        />

        <FormField
          label={content.count.label}
          value={count}
          inputMode='numeric'
          placeholder={content.count.placeholder}
          state={selectedPreset ? 'locked' : countError ? 'error' : count ? 'filled' : 'default'}
          trailing={content.count.unit}
          trailingSize='body'
          errorMessage={countError}
          onBlur={() => setHasCountBlurred(true)}
          onChange={(event) => setCount(event.target.value.replace(/\D/g, '').slice(0, 4))}
        />

        <div className='flex flex-col gap-x4'>
          <p className='label-medium text-text-secondary px-x1'>{content.duration.label}</p>
          <fieldset disabled={Boolean(selectedPreset)} className='flex min-w-0 flex-col gap-x4 disabled:opacity-50'>
            <div className='flex flex-wrap justify-between gap-y-3'>
              <DurationChip selected={choice === 'none'} disabled={Boolean(selectedPreset)} onClick={() => setChoice('none')}>
                {content.duration.none}
              </DurationChip>
              {MONTH_PRESETS.map((months) => (
                <DurationChip
                  key={months}
                  selected={choice === months}
                  disabled={Boolean(selectedPreset)}
                  onClick={() => setChoice(months)}
                >
                  {content.duration.month(months)}
                </DurationChip>
              ))}
              <CustomDurationChip
                selected={choice === 'custom'}
                disabled={Boolean(selectedPreset)}
                onClick={() => setChoice('custom')}
              >
                {content.duration.custom}
              </CustomDurationChip>
            </div>
            {choice === 'custom' ? (
              <DurationUnitField
                unit={unit}
                value={customAmount}
                inputMode='numeric'
                disabled={Boolean(selectedPreset)}
                onUnitChange={selectedPreset ? undefined : setUnit}
                onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            ) : null}
          </fieldset>
          {endDate ? (
            <p className='caption1-regular text-fill-secondary-500 px-x1'>
              {content.duration.hint(formatChargeDotDate(startDate), formatChargeDotDate(endDate))}
            </p>
          ) : null}
        </div>
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
      <TicketChargePresetSheet
        isOpen={isPresetOpen}
        presets={presets}
        selectedId={selectedPreset?.id ?? null}
        onOpenChange={setIsPresetOpen}
        onSelectDirect={handleSelectDirect}
        onSelectPreset={handleSelectPreset}
      />
      <TicketChargeLeaveDialog isOpen={isLeaveOpen} onStay={() => setIsLeaveOpen(false)} onLeave={handleLeave} />
    </div>
  );
}

export { MemberTicketChargePage };
