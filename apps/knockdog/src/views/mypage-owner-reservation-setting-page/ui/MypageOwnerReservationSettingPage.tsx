'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
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
import { useReservationSettingQuery, type ReservationSetting } from '@entities/owner-reservation-setting';
import { getUserHydrationStatus, subscribeUserHydration, useUserStore } from '@entities/user';
import { openOwnerUnsavedExitDialog } from '@features/role-conversion';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { OptionSelectSheet } from '@shared/ui/option-select-sheet';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import { BottomCta } from '@shared/ui/bottom-cta';
import { Header } from '@widgets/Header';
import {
  TIME_OPTIONS,
  TIME_SHEET_TITLE,
  type AdmissionTimeField,
} from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { useReservationSettingForm } from '@views/mypage-owner-reservation-setting-page/model/useReservationSettingForm';

/** 행 높이(py-4 32px + body1 24px + 구분선 1px) × 3 */
const TIME_SHEET_LIST_CLASS = 'h-[calc(3*(2rem+1.5rem+1px))] max-h-[calc(3*(2rem+1.5rem+1px))]';
const FIELD_LABEL_CLASS = 'label-medium text-text-secondary px-x1 leading-[18px] font-medium';
const HEADER_TITLE_CLASS = 'h2-extrabold text-[length:var(--font-size-h2)] leading-7';

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
    <Field className='shrink-0 gap-4 px-4 pt-5'>
      <FieldLabel className={FIELD_LABEL_CLASS}>{label}</FieldLabel>
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
      <Header className='h-[66px] shrink-0' innerClassName='h-full gap-x-1'>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title className={HEADER_TITLE_CLASS}>예약 설정</Header.Title>
      </Header>
      {isError ? (
        <PageError layout='inline' title={title} description={description} onRetry={onRetry} isRetrying={isRetrying} />
      ) : (
        <DelayedLoadingSpinner isLoading layout='content' />
      )}
    </div>
  );
}

function ReservationSettingEditor({ setting }: { setting: ReservationSetting }) {
  const form = useReservationSettingForm(setting);
  const handleBackRef = useRef(() => {});
  const capacityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIphoneSafari = /iPhone/.test(userAgent) && /Version\/[\d.]+.*Safari\//.test(userAgent) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
    if (!isIphoneSafari) return;

    const viewport = window.visualViewport;
    const capacity = capacityRef.current;
    if (!viewport || !capacity) return;

    let scrollPosition: { top: number; left: number; height: number } | null = null;
    let frameId = 0;

    const handleFocus = () => {
      scrollPosition ??= { top: window.scrollY, left: window.scrollX, height: viewport.height };
    };
    const handleViewportChange = () => {
      if (!scrollPosition) return;
      // 키보드가 닫힌 뒤 남은 문서 이동만 복원한다. 본문 scrollTop은 건드리지 않는다.
      if (viewport.height < scrollPosition.height - 80) return;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (!scrollPosition) return;
        window.scrollTo({ top: scrollPosition.top, left: scrollPosition.left, behavior: 'instant' });
        if (!capacity.contains(document.activeElement) && Math.abs(viewport.offsetTop) < 1) {
          scrollPosition = null;
        }
      });
    };

    capacity.addEventListener('focusin', handleFocus);
    capacity.addEventListener('focusout', handleViewportChange);
    viewport.addEventListener('resize', handleViewportChange);
    viewport.addEventListener('scroll', handleViewportChange);
    return () => {
      window.cancelAnimationFrame(frameId);
      capacity.removeEventListener('focusin', handleFocus);
      capacity.removeEventListener('focusout', handleViewportChange);
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

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

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLInputElement) activeElement.blur();

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
    });
  };

  const { hoursLine, closedLine } = form;

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden bg-white'>
      <Header className='relative h-[66px] shrink-0' innerClassName='h-full gap-x-1'>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title className={HEADER_TITLE_CLASS}>예약 설정</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain py-4 [-webkit-overflow-scrolling:touch]'>
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

        <Field className='shrink-0 gap-4 px-4 pt-5'>
          <FieldLabel className={FIELD_LABEL_CLASS}>
            하루 정원
            <FieldLabelIndicator type='optional' className='text-text-accent ml-0' />
          </FieldLabel>
          <div ref={capacityRef} className='flex flex-col gap-2'>
            <NumberField
              value={form.values.dailyCapacity}
              onChange={(event) => form.handleCapacityChange(event.target.value)}
              state={form.capacityError ? 'error' : form.values.dailyCapacity ? 'filled' : 'default'}
              errorMessage={form.capacityError}
              aria-label='하루 정원'
            />
            <FieldDescription className='caption1-regular text-text-secondary min-h-5 px-x1 text-left text-[length:var(--font-size-caption1)] leading-[18px] webview:[-webkit-text-size-adjust:100%]'>
              * 미입력시 정원 제한 없이 예약을 받아요.
            </FieldDescription>
          </div>
        </Field>

        <section className='caption1-regular text-fill-secondary-500 flex shrink-0 flex-col gap-2.5 px-5 py-5 text-left leading-[18px] webview:[-webkit-text-size-adjust:100%]'>
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

      <BottomCta className='shrink-0 bg-white px-4 py-4'>
        <ActionButton
          type='button'
          size='large'
          variant='primaryFill'
          disabled={!form.isSaveEnabled}
          onClick={handleSave}
        >
          <span className='body1-bold'>저장하기</span>
        </ActionButton>
      </BottomCta>

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
  const userHydrationStatus = useSyncExternalStore(
    subscribeUserHydration,
    getUserHydrationStatus,
    () => 'pending' as const
  );
  const [isHydrationRetrying, setIsHydrationRetrying] = useState(false);
  const userId = useUserStore((state) => state.user?.userId);
  const settingQuery = useReservationSettingQuery({ userId });
  const handleAuthRetry = () => {
    setIsHydrationRetrying(true);
    void Promise.resolve(useUserStore.persist.rehydrate()).finally(() => {
      setIsHydrationRetrying(false);
    });
  };

  if (userHydrationStatus === 'error') {
    return <ReservationSettingPending isError isRetrying={isHydrationRetrying} onRetry={handleAuthRetry} />;
  }

  if (userHydrationStatus !== 'ready') {
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
