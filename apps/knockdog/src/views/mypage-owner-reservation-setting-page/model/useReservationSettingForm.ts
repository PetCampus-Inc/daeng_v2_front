'use client';

import { useMemo, useState } from 'react';
import { useOwnerKindergarten } from '@features/role-conversion';
import { useStackNavigation } from '@shared/lib/bridge';
import { TIME_PLACEHOLDER, type AdmissionTimeField } from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { formatOperatingHoursNote } from '@views/mypage-owner-reservation-setting-page/lib/formatOperatingHoursNote';
import {
  EMPTY_RESERVATION_SETTING,
  applyConfirmedTime,
  canSaveReservationSetting,
  capacityLimitError,
  isSameReservationSetting,
  sanitizeDailyCapacity,
  timeOrderError,
  type ReservationSettingValues,
} from '@views/mypage-owner-reservation-setting-page/lib/reservationSettingRules';

/** 예약이 가장 많은 날의 마리 수. 예약 API가 연결되면 그 값으로 바꾼다. */
const PEAK_DAILY_RESERVATION_COUNT: number | null = null;

function isStartTimeField(field: AdmissionTimeField) {
  return field === 'weekdayStart' || field === 'weekendStart';
}

function useReservationSettingForm() {
  const { back } = useStackNavigation();
  const { basic } = useOwnerKindergarten();
  const [baseline, setBaseline] = useState<ReservationSettingValues>(EMPTY_RESERVATION_SETTING);
  const [values, setValues] = useState<ReservationSettingValues>(EMPTY_RESERVATION_SETTING);
  const [activeTimeField, setActiveTimeField] = useState<AdmissionTimeField | null>(null);

  const operatingHoursNote = useMemo(
    () => formatOperatingHoursNote(basic?.operationTimes?.[0]),
    [basic?.operationTimes]
  );

  const weekdayTimeError = timeOrderError(values.weekdayStart, values.weekdayEnd);
  const weekendTimeError = timeOrderError(values.weekendStart, values.weekendEnd);
  const capacityError = capacityLimitError(values.dailyCapacity, PEAK_DAILY_RESERVATION_COUNT);
  const isDirty = !isSameReservationSetting(values, baseline);
  const isSaveEnabled = canSaveReservationSetting(values, baseline, PEAK_DAILY_RESERVATION_COUNT);

  const updateValue = <Key extends keyof ReservationSettingValues>(
    key: Key,
    next: ReservationSettingValues[Key]
  ) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleCapacityChange = (next: string) => {
    updateValue('dailyCapacity', sanitizeDailyCapacity(next));
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
    setValues((prev) => applyConfirmedTime(prev, activeTimeField, value));
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
