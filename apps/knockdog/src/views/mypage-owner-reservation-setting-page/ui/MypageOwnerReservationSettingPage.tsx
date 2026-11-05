'use client';

import { useCallback, useRef } from 'react';
import {
  ActionButton,
  Field,
  FieldDescription,
  FieldLabel,
  FieldLabelIndicator,
  Icon,
  NumberField,
  TimeRangeField,
  type TimeRangeState,
} from '@knockdog/ui';
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

function timeRangeState(start: string | null, end: string | null, error?: string | null): TimeRangeState {
  if (error) return 'error';
  if (start || end) return 'filled';
  return 'default';
}

interface AdmissionTimeRangeProps {
  label: string;
  start: string | null;
  end: string | null;
  startField: AdmissionTimeField;
  endField: AdmissionTimeField;
  error?: string | null;
  onOpen: (field: AdmissionTimeField) => void;
}

function AdmissionTimeRange({ label, start, end, startField, endField, error, onOpen }: AdmissionTimeRangeProps) {
  return (
    <Field className='gap-4 px-4 pt-5'>
      <FieldLabel className='px-1'>{label}</FieldLabel>
      <TimeRangeField
        startTime={start ?? TIME_PLACEHOLDER.start}
        endTime={end ?? TIME_PLACEHOLDER.end}
        state={timeRangeState(start, end, error)}
        errorMessage={error}
        onStartClick={() => onOpen(startField)}
        onEndClick={() => onOpen(endField)}
      />
    </Field>
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
        <AdmissionTimeRange
          label='평일 등원 가능 시간'
          start={form.values.weekdayStart}
          end={form.values.weekdayEnd}
          startField='weekdayStart'
          endField='weekdayEnd'
          error={form.weekdayTimeError}
          onOpen={form.openTimeField}
        />
        <AdmissionTimeRange
          label='주말 등원 가능 시간'
          start={form.values.weekendStart}
          end={form.values.weekendEnd}
          startField='weekendStart'
          endField='weekendEnd'
          error={form.weekendTimeError}
          onOpen={form.openTimeField}
        />

        <Field className='gap-4 px-4 pt-4'>
          <FieldLabel className='px-1'>
            하루 정원
            <FieldLabelIndicator type='optional' />
          </FieldLabel>
          <div className='flex flex-col gap-2'>
            <NumberField
              value={form.values.dailyCapacity}
              onChange={(event) => form.handleCapacityChange(event.target.value)}
              state={form.capacityError ? 'error' : form.values.dailyCapacity ? 'filled' : 'default'}
              errorMessage={form.capacityError}
              aria-label='하루 정원'
            />
            <FieldDescription className='caption1-regular text-text-secondary px-2'>
              * 미입력시 정원 제한 없이 예약을 받아요.
            </FieldDescription>
          </div>
        </Field>

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
