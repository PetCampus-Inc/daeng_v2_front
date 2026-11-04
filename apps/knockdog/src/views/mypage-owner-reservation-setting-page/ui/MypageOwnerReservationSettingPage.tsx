'use client';

import { useCallback, useRef } from 'react';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { OptionSelectSheet } from '@shared/ui/option-select-sheet';
import {
  TIME_PLACEHOLDER,
  TIME_SHEET_TITLE,
  type AdmissionTimeField,
} from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { useReservationSettingForm } from '@views/mypage-owner-reservation-setting-page/model/useReservationSettingForm';

import { Header } from '@widgets/Header';
import { openOwnerUnsavedExitDialog } from '@features/role-conversion';
import { useNativeBackHandler } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';

interface TimeFieldProps {
  value: string | null;
  placeholder: string;
  label: string;
  onClick: () => void;
}

function TimeField({ value, placeholder, label, onClick }: TimeFieldProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      className='radius-r3 border-line-200 bg-fill-secondary-0 flex h-[58px] min-w-0 flex-1 items-center justify-between border py-4 pr-3 pl-4'
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
  onOpen: (field: AdmissionTimeField) => void;
}

function TimeRangeField({ label, start, end, startField, endField, onOpen }: TimeRangeFieldProps) {
  return (
    <section className='flex flex-col gap-4 px-4 pt-5'>
      <p className='body2-medium text-text-secondary px-1'>{label}</p>
      <div className='flex items-center'>
        <TimeField
          value={start}
          placeholder={TIME_PLACEHOLDER.start}
          label={`${label} 시작`}
          onClick={() => onOpen(startField)}
        />
        <span className='body1-regular text-text-tertiary px-1'>~</span>
        <TimeField
          value={end}
          placeholder={TIME_PLACEHOLDER.end}
          label={`${label} 종료`}
          onClick={() => onOpen(endField)}
        />
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
          onOpen={form.openTimeField}
        />
        <TimeRangeField
          label='주말 등원 가능 시간'
          start={form.values.weekendStart}
          end={form.values.weekendEnd}
          startField='weekendStart'
          endField='weekendEnd'
          onOpen={form.openTimeField}
        />

        <section className='flex flex-col gap-4 px-4 pt-4'>
          <p className='body2-medium text-text-secondary px-1'>
            하루 정원 <span className='text-text-accent'>(선택)</span>
          </p>
          <div className='flex flex-col gap-2'>
            <TextField
              className='h-[58px]'
              suffix={<span className='body2-regular text-text-secondary font-normal'>마리</span>}
            >
              <TextFieldInput
                inputMode='numeric'
                value={form.values.dailyCapacity}
                onChange={(event) => form.handleCapacityChange(event.target.value)}
                aria-label='하루 정원'
              />
            </TextField>
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
          onClick={form.handleSave}
        >
          저장하기
        </ActionButton>
      </div>

      <OptionSelectSheet
        isOpen={form.activeTimeField !== null}
        close={form.closeTimeSheet}
        title={form.activeTimeField ? TIME_SHEET_TITLE[form.activeTimeField] : ''}
        options={form.activeTimeOptions}
        value={form.activeTimeValue}
        confirmLabel='확인'
        onSelect={form.handleTimeConfirm}
      />
    </div>
  );
}

export { MypageOwnerReservationSettingPage };
