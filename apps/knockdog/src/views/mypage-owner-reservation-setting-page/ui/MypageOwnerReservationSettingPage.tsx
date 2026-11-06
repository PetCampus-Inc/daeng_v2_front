'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
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
import {
  useReservationSettingQuery,
  type ReservationSetting,
} from '@entities/owner-reservation-setting';
import { useUserStore } from '@entities/user';
import { openOwnerUnsavedExitDialog } from '@features/role-conversion';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { OptionSelectSheet } from '@shared/ui/option-select-sheet';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import { Header } from '@widgets/Header';
import {
  TIME_OPTIONS,
  TIME_SHEET_TITLE,
  type AdmissionTimeField,
} from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { useReservationSettingForm } from '@views/mypage-owner-reservation-setting-page/model/useReservationSettingForm';

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
      <FieldLabel className='text-text-secondary px-1'>{label}</FieldLabel>
      <TimeRangeField
        startTime={start ?? ''}
        endTime={end ?? ''}
        state={timeRangeState(start, end, error)}
        errorMessage={error}
        onStartClick={() => onOpen(startField)}
        onEndClick={() => onOpen(endField)}
      />
    </Field>
  );
}

function ReservationSettingPending({
  isError,
  isRetrying,
  onRetry,
  title,
  description,
}: {
  isError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  const { back } = useStackNavigation();
  const handleBack = useCallback(() => {
    back?.();
  }, [back]);

  useNativeBackHandler(handleBack);

  return (
    <div className='flex h-full flex-col bg-white'>
      <Header>
        <Header.LeftSection className='relative z-10'>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>예약 설정</Header.Title>
      </Header>
      {isError ? (
        <PageError
          layout='inline'
          title={title}
          description={description}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      ) : (
        <DelayedLoadingSpinner isLoading layout='content' />
      )}
    </div>
  );
}

function ReservationSettingEditor({ setting }: { setting: ReservationSetting }) {
  const form = useReservationSettingForm(setting);
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

  const handleSave = async () => {
    if (!form.isSaveEnabled) return;

    const result = await form.handleSave();
    if (!result) return;

    const saved = result === 'saved';
    toast({
      type: saved ? 'success' : 'default',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: saved ? '예약 설정을 저장했어요' : result,
      title: saved ? (
        '예약 설정을 저장했어요'
      ) : (
        <span className='inline-flex items-center gap-2'>
          <Icon icon='Close' className='size-6 shrink-0' />
          {result}
        </span>
      ),
      viewportClassName: SAVE_TOAST_VIEWPORT,
    });
  };

  const { hoursLine, closedLine } = form;

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
          <FieldLabel className='text-text-secondary px-1'>
            하루 정원
            <FieldLabelIndicator type='optional' className='text-text-accent' />
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

        <section className='caption1-regular text-fill-secondary-500 flex flex-col gap-2.5 px-6 py-5'>
          {hoursLine || closedLine ? (
            <p>
              * 현재 운영시간
              <br />
              {hoursLine ? `- ${hoursLine}` : null}
              {hoursLine && closedLine ? <br /> : null}
              {closedLine ? `- ${closedLine}` : null}
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

function MypageOwnerReservationSettingPage() {
  const hasUserStoreHydrated = useSyncExternalStore(
    (onStoreChange) => useUserStore.persist.onFinishHydration(onStoreChange),
    () => useUserStore.persist.hasHydrated(),
    () => false
  );
  const userId = useUserStore((state) => state.user?.userId);
  const settingQuery = useReservationSettingQuery({ userId });
  const handleAuthRetry = () => {
    void useUserStore.persist.rehydrate();
  };

  if (!hasUserStoreHydrated) {
    return <ReservationSettingPending isError={false} isRetrying={false} onRetry={handleAuthRetry} />;
  }

  if (!userId) {
    return (
      <ReservationSettingPending
        isError
        isRetrying={false}
        title='로그인 정보를 불러오지 못했어요'
        description='다시 로그인한 뒤 시도해 주세요.'
        onRetry={handleAuthRetry}
      />
    );
  }

  if (!settingQuery.data) {
    return (
      <ReservationSettingPending
        isError={settingQuery.isError}
        isRetrying={settingQuery.isFetching}
        onRetry={() => {
          void settingQuery.refetch();
        }}
      />
    );
  }

  return <ReservationSettingEditor setting={settingQuery.data} />;
}

export { MypageOwnerReservationSettingPage };
