'use client';

import { useCallback, useRef } from 'react';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { OptionSelectSheet } from '@shared/ui/option-select-sheet';
import {
  TIME_OPTIONS,
  TIME_PLACEHOLDER,
  TIME_SHEET_TITLE,
  type AdmissionTimeField,
} from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { useReservationSettingForm } from '@views/mypage-owner-reservation-setting-page/model/useReservationSettingForm';

import { Header } from '@widgets/Header';
import { openOwnerUnsavedExitDialog } from '@features/role-conversion';
import { useNativeBackHandler } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { toast } from '@shared/ui/toast';

const SAVE_TOAST_VIEWPORT = 'bottom-[104px] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2';
/** 행 높이(py-4 32px + body1 24px + 구분선 1px) × 3 */
const TIME_SHEET_LIST_CLASS = 'h-[calc(3*(2rem+1.5rem+1px))] max-h-[calc(3*(2rem+1.5rem+1px))]';

interface TimeFieldProps {
  value: string | null;
  placeholder: string;
  label: string;
  invalid?: boolean;
  onClick: () => void;
}

function TimeField({ value, placeholder, label, invalid = false, onClick }: TimeFieldProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      aria-invalid={invalid}
      className={`radius-r3 bg-fill-secondary-0 flex h-[58px] min-w-0 flex-1 items-center justify-between border py-4 pr-3 pl-4 ${
        invalid ? 'border-error' : 'border-line-200'
      }`}
    >
      <span className={`body1-medium ${value ? 'text-text-primary' : 'text-text-caption'}`}>
        {value || placeholder}
      </span>
      <Icon icon='ChevronBottom' className='text-text-tertiary size-6 shrink-0' />
    </button>
  );
}

interface TimeRangeFieldProps {
  label: string;
  start: string | null;
  end: string | null;
  startField: AdmissionTimeField;
  endField: AdmissionTimeField;
  error?: string | null;
  onOpen: (field: AdmissionTimeField) => void;
}

function TimeRangeField({ label, start, end, startField, endField, error, onOpen }: TimeRangeFieldProps) {
  return (
    <section className='flex flex-col gap-4 px-4 pt-5'>
      <p className='body2-medium text-text-secondary px-1'>{label}</p>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center'>
          <TimeField
            value={start}
            placeholder={TIME_PLACEHOLDER.start}
            label={`${label} 시작`}
            invalid={Boolean(error)}
            onClick={() => onOpen(startField)}
          />
          <span className='body1-regular text-text-tertiary px-1'>~</span>
          <TimeField
            value={end}
            placeholder={TIME_PLACEHOLDER.end}
            label={`${label} 종료`}
            invalid={Boolean(error)}
            onClick={() => onOpen(endField)}
          />
        </div>
        {error ? <p className='caption1-regular text-error px-1'>{error}</p> : null}
      </div>
    </section>
  );
}

function MypageOwnerReservationSettingPage() {
  const form = useReservationSettingForm();
  const handleBackRef = useRef(() => {});

  const { releaseAndLeave } = useUnsavedBrowserBackGuard(form.isDirty, () => {
    handleBackRef.current();
  });

  const handleBack = useCallback(() => {
    if (!form.isDirty) {
      releaseAndLeave(() => {
        form.leaveIfClean();
      });
      return;
    }

    openOwnerUnsavedExitDialog(() => {
      releaseAndLeave(form.handleLeaveWithoutSaving);
    });
  }, [form.handleLeaveWithoutSaving, form.isDirty, form.leaveIfClean, releaseAndLeave]);

  handleBackRef.current = handleBack;
  useNativeBackHandler(handleBack);

  const handleSave = () => {
    if (!form.isSaveEnabled) return;

    const saved = form.handleSave();
    toast({
      type: saved ? 'success' : 'default',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: saved ? '예약 설정을 저장했어요' : '예약 설정을 저장하지 못했어요',
      title: saved ? (
        '예약 설정을 저장했어요'
      ) : (
        <span className='inline-flex items-center gap-2'>
          <Icon icon='Close' className='size-6 shrink-0' />
          예약 설정을 저장하지 못했어요
        </span>
      ),
      viewportClassName: SAVE_TOAST_VIEWPORT,
    });
  };

  const { hoursLine, closedLine } = form.operatingHoursNote;

  return (
    <div className='flex h-full flex-col bg-white'>
      <Header>
        <Header.LeftSection className='relative z-10'>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>예약 설정</Header.Title>
      </Header>

      <div className='flex-1 overflow-y-auto overscroll-y-contain pb-5 [-webkit-overflow-scrolling:touch]'>
        <TimeRangeField
          label='평일 등원 가능 시간'
          start={form.values.weekdayStart}
          end={form.values.weekdayEnd}
          startField='weekdayStart'
          endField='weekdayEnd'
          error={form.weekdayTimeError}
          onOpen={form.openTimeField}
        />
        <TimeRangeField
          label='주말 등원 가능 시간'
          start={form.values.weekendStart}
          end={form.values.weekendEnd}
          startField='weekendStart'
          endField='weekendEnd'
          error={form.weekendTimeError}
          onOpen={form.openTimeField}
        />

        <section className='flex flex-col gap-4 px-4 pt-4'>
          <p className='body2-medium text-text-secondary px-1'>
            하루 정원 <span className='text-text-accent'>(선택)</span>
          </p>
          <div className='flex flex-col gap-2'>
            <TextField
              className='h-[58px]'
              invalid={Boolean(form.capacityError)}
              suffix={<span className='body2-regular text-text-secondary font-normal'>마리</span>}
            >
              <TextFieldInput
                inputMode='numeric'
                value={form.values.dailyCapacity}
                onChange={(event) => form.handleCapacityChange(event.target.value)}
                aria-label='하루 정원'
              />
            </TextField>
            {form.capacityError ? (
              <p className='caption1-regular text-error px-2'>{form.capacityError}</p>
            ) : null}
            <p className='caption1-regular text-text-secondary px-2'>
              * 미입력시 정원 제한 없이 예약을 받아요.
            </p>
          </div>
        </section>

        <section className='caption1-regular text-primitive-neutral-500 flex flex-col gap-2.5 px-5 py-5'>
          {hoursLine ? (
            <p>
              * 현재 운영시간
              <br />
              {`- ${hoursLine}`}
              {closedLine ? (
                <>
                  <br />
                  {`- ${closedLine}`}
                </>
              ) : null}
            </p>
          ) : null}
          <p>* 운영 시간은 유치원 기본 정보에서 변경 가능해요.</p>
        </section>
      </div>

      <div className='shrink-0 bg-white px-4 py-4'>
        <ActionButton
          type='button'
          size='large'
          variant='primaryFill'
          className='radius-r3'
          disabled={!form.isSaveEnabled}
          onClick={handleSave}
        >
          저장하기
        </ActionButton>
      </div>

      <OptionSelectSheet
        isOpen={form.activeTimeField !== null}
        close={form.closeTimeSheet}
        title={form.activeTimeField ? TIME_SHEET_TITLE[form.activeTimeField] : ''}
        options={TIME_OPTIONS}
        value={form.activeTimeValue}
        confirmLabel='확인'
        listClassName={TIME_SHEET_LIST_CLASS}
        onSelect={form.handleTimeConfirm}
      />
    </div>
  );
}

export { MypageOwnerReservationSettingPage };
