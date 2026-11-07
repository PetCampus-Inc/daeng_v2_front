'use client';

import { useEffect, useRef, useState } from 'react';

import {
  toReservationSetting,
  usePutReservationMutation,
  type ReservationSetting,
} from '@entities/owner-reservation-setting';
import { useUserStore } from '@entities/user';
import { mapRequestErrorMessage } from '@shared/api';
import { useStackNavigation } from '@shared/lib/bridge';
import { TIME_PLACEHOLDER, type AdmissionTimeField } from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import {
  applyConfirmedTime,
  canSaveReservationSetting,
  capacityLimitError,
  isSameReservationSetting,
  keepUnsavedReservationEdits,
  sanitizeDailyCapacity,
  timeOrderError,
  type ReservationSettingValues,
} from '@views/mypage-owner-reservation-setting-page/lib/reservationSettingRules';

const toFormValues = (setting: ReservationSetting): ReservationSettingValues => ({
  weekdayStart: setting.weekdayStart,
  weekdayEnd: setting.weekdayEnd,
  weekendStart: setting.weekendStart,
  weekendEnd: setting.weekendEnd,
  dailyCapacity: setting.dailyCapacity,
});

/** 예약이 가장 많은 날의 마리 수. 예약 API가 연결되면 그 값으로 바꾼다. */
const PEAK_DAILY_RESERVATION_COUNT: number | null = null;

function isStartTimeField(field: AdmissionTimeField) {
  return field === 'weekdayStart' || field === 'weekendStart';
}

function useReservationSettingForm(setting: ReservationSetting) {
  const { back } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { mutateAsync, isPending: isSaving } = usePutReservationMutation(userId);
  const initialValues = toFormValues(setting);
  const [baseline, setBaseline] = useState<ReservationSettingValues>(initialValues);
  const [values, setValues] = useState<ReservationSettingValues>(initialValues);
  const [activeTimeField, setActiveTimeField] = useState<AdmissionTimeField | null>(null);
  const baselineRef = useRef(baseline);
  baselineRef.current = baseline;

  useEffect(() => {
    const incoming = toFormValues(setting);
    const previous = baselineRef.current;
    if (isSameReservationSetting(incoming, previous)) return;

    setValues((current) => keepUnsavedReservationEdits(previous, current, incoming));
    setBaseline(incoming);
  }, [setting]);

  const weekdayTimeError = timeOrderError(values.weekdayStart, values.weekdayEnd);
  const weekendTimeError = timeOrderError(values.weekendStart, values.weekendEnd);
  const capacityError = capacityLimitError(values.dailyCapacity, PEAK_DAILY_RESERVATION_COUNT);
  const isDirty = !isSameReservationSetting(values, baseline);
  const isSaveEnabled = canSaveReservationSetting(values, baseline, PEAK_DAILY_RESERVATION_COUNT) && !isSaving;

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

  /** 성공하면 응답을 기준값으로 잡는다. 요청 중에 고친 칸은 미저장으로 남긴다. */
  const handleSave = async () => {
    if (!isSaveEnabled) return null;

    const snapshot = values;

    try {
      const saved = toFormValues(toReservationSetting(await mutateAsync(snapshot)));
      setBaseline(saved);
      setValues((current) => keepUnsavedReservationEdits(snapshot, current, saved));
      return 'saved' as const;
    } catch (error) {
      return mapRequestErrorMessage(error);
    }
  };

  const leaveIfClean = () => {
    if (isDirty) return false;
    back?.();
    return true;
  };

  return {
    values,
    hoursLine: setting.hoursLine,
    closedLine: setting.closedLine,
    isDirty,
    isSaving,
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
