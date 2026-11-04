'use client';

import { useMemo, useState } from 'react';
import { useOwnerKindergarten } from '@features/role-conversion';
import { useStackNavigation } from '@shared/lib/bridge';
import {
  TIME_OPTIONS,
  TIME_PLACEHOLDER,
  type AdmissionTimeField,
} from '@views/mypage-owner-reservation-setting-page/config/timeOptions';
import { formatOperatingHoursNote } from '@views/mypage-owner-reservation-setting-page/lib/formatOperatingHoursNote';

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

function hasCompleteAdmissionTimes(values: ReservationSettingValues) {
  return Boolean(values.weekdayStart && values.weekdayEnd && values.weekendStart && values.weekendEnd);
}

function isStartTimeField(field: AdmissionTimeField) {
  return field === 'weekdayStart' || field === 'weekendStart';
}

function startKeyOf(field: AdmissionTimeField) {
  if (field === 'weekdayEnd') return 'weekdayStart' as const;
  if (field === 'weekendEnd') return 'weekendStart' as const;
  return null;
}

function endKeyOf(field: AdmissionTimeField) {
  if (field === 'weekdayStart') return 'weekdayEnd' as const;
  if (field === 'weekendStart') return 'weekendEnd' as const;
  return null;
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
  const isSaveEnabled = hasCompleteAdmissionTimes(values) && isDirty;

  const updateValue = <Key extends keyof ReservationSettingValues>(
    key: Key,
    next: ReservationSettingValues[Key]
  ) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleCapacityChange = (next: string) => {
    updateValue('dailyCapacity', next.replace(/\D/g, '').slice(0, 3));
  };

  const activeTimeOptions = useMemo(() => {
    if (!activeTimeField) return TIME_OPTIONS;

    const startKey = startKeyOf(activeTimeField);
    if (!startKey) return TIME_OPTIONS.filter((option) => option.value !== '24:00');

    const start = values[startKey];
    if (!start) return TIME_OPTIONS;
    return TIME_OPTIONS.filter((option) => option.value > start);
  }, [activeTimeField, values.weekdayStart, values.weekendStart]);

  const activeTimeValue = useMemo(() => {
    if (!activeTimeField) return null;

    const current = values[activeTimeField];
    const fallback = isStartTimeField(activeTimeField) ? TIME_PLACEHOLDER.start : TIME_PLACEHOLDER.end;
    const candidate = current ?? fallback;
    return activeTimeOptions.some((option) => option.value === candidate) ? candidate : null;
  }, [activeTimeField, activeTimeOptions, values]);

  const openTimeField = (field: AdmissionTimeField) => {
    setActiveTimeField(field);
  };

  const closeTimeSheet = () => {
    setActiveTimeField(null);
  };

  /** 확인 값만 화면에 반영한다. 저장 API 호출은 하지 않는다. */
  const handleTimeConfirm = (value: string) => {
    if (!activeTimeField) return;

    setValues((prev) => {
      const next = { ...prev, [activeTimeField]: value };
      const endKey = endKeyOf(activeTimeField);
      if (endKey && next[endKey] && next[endKey] <= value) next[endKey] = null;
      return next;
    });
  };

  /**
   * 예약 설정 저장 API가 아직 없다.
   * 저장은 현재 값을 기준값으로 잡아, 되돌리면 버튼이 다시 꺼지게만 한다.
   */
  const handleSave = () => {
    if (!isSaveEnabled) return;
    setBaseline(values);
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
    activeTimeField,
    activeTimeOptions,
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
