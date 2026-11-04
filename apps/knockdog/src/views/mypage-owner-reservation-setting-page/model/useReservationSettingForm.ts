'use client';

import { useMemo, useState } from 'react';
import { useOwnerKindergarten } from '@features/role-conversion';
import { useStackNavigation } from '@shared/lib/bridge';
import { TIME_PLACEHOLDER, type AdmissionTimeField } from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { formatOperatingHoursNote } from '@views/mypage-owner-reservation-setting-page/lib/formatOperatingHoursNote';

const TIME_ORDER_ERROR = '시작 시간은 종료 시간보다 빨라야 해요';

/** 예약이 가장 많은 날의 마리 수. 예약 API가 연결되면 그 값으로 바꾼다. */
const PEAK_DAILY_RESERVATION_COUNT: number | null = null;

function timeOrderError(start: string | null, end: string | null) {
  if (!start || !end || start < end) return null;
  return TIME_ORDER_ERROR;
}

function capacityLimitError(value: string, peak: number | null) {
  if (!value || peak == null) return null;
  const count = Number(value);
  if (!Number.isFinite(count) || count >= peak) return null;
  return `하루 ${peak}마리가 예약된 날이 있어 ${peak}마리보다 적게 정할 수 없어요.`;
}

interface ReservationSettingValues {
  weekdayStart: string | null;
  weekdayEnd: string | null;
  weekendStart: string | null;
  weekendEnd: string | null;
  dailyCapacity: string;
}

const EMPTY_VALUES: ReservationSettingValues = {
  weekdayStart: null,
  weekdayEnd: null,
  weekendStart: null,
  weekendEnd: null,
  dailyCapacity: '',
};

function isSameValues(left: ReservationSettingValues, right: ReservationSettingValues) {
  return (
    left.weekdayStart === right.weekdayStart &&
    left.weekdayEnd === right.weekdayEnd &&
    left.weekendStart === right.weekendStart &&
    left.weekendEnd === right.weekendEnd &&
    left.dailyCapacity === right.dailyCapacity
  );
}

function isStartTimeField(field: AdmissionTimeField) {
  return field === 'weekdayStart' || field === 'weekendStart';
}

function useReservationSettingForm() {
  const { back } = useStackNavigation();
  const { basic } = useOwnerKindergarten();
  const [baseline, setBaseline] = useState<ReservationSettingValues>(EMPTY_VALUES);
  const [values, setValues] = useState<ReservationSettingValues>(EMPTY_VALUES);
  const [activeTimeField, setActiveTimeField] = useState<AdmissionTimeField | null>(null);

  const operatingHoursNote = useMemo(
    () => formatOperatingHoursNote(basic?.operationTimes?.[0]),
    [basic?.operationTimes]
  );

  const isDirty = !isSameValues(values, baseline);
  const weekdayTimeError = timeOrderError(values.weekdayStart, values.weekdayEnd);
  const weekendTimeError = timeOrderError(values.weekendStart, values.weekendEnd);
  const capacityError = capacityLimitError(values.dailyCapacity, PEAK_DAILY_RESERVATION_COUNT);
  const hasFieldError = Boolean(weekdayTimeError || weekendTimeError || capacityError);
  const isSaveEnabled = isDirty && !hasFieldError;

  const updateValue = <Key extends keyof ReservationSettingValues>(
    key: Key,
    next: ReservationSettingValues[Key]
  ) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleCapacityChange = (next: string) => {
    updateValue('dailyCapacity', next.replace(/\D/g, '').slice(0, 3));
  };

  const activeTimeValue = activeTimeField
    ? (values[activeTimeField] ??
      (isStartTimeField(activeTimeField) ? TIME_PLACEHOLDER.start : TIME_PLACEHOLDER.end))
    : null;

  const openTimeField = (field: AdmissionTimeField) => {
    setActiveTimeField(field);
  };

  const closeTimeSheet = () => {
    setActiveTimeField(null);
  };

  /** 확인 값만 화면에 반영한다. 시작이 종료보다 늦으면 값은 유지하고 인라인 오류를 보여 준다. */
  const handleTimeConfirm = (value: string) => {
    if (!activeTimeField) return;
    setValues((prev) => ({ ...prev, [activeTimeField]: value }));
  };

  /**
   * 예약 설정 저장 API가 아직 없다.
   * 성공하면 현재 값을 기준값으로 잡는다. 실패하면 입력값을 그대로 둔다.
   */
  const handleSave = () => {
    if (!isSaveEnabled) return false;
    setBaseline(values);
    return true;
  };

  const leaveIfClean = () => {
    if (isDirty) return false;
    back?.();
    return true;
  };

  return {
    values,
    operatingHoursNote,
    isDirty,
    isSaveEnabled,
    weekdayTimeError,
    weekendTimeError,
    capacityError,
    activeTimeField,
    activeTimeValue,
    openTimeField,
    closeTimeSheet,
    handleTimeConfirm,
    handleCapacityChange,
    handleSave,
    leaveIfClean,
    handleLeaveWithoutSaving: () => back?.(),
  };
}

export { useReservationSettingForm };
