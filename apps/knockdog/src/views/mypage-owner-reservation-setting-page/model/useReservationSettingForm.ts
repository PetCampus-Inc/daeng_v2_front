'use client';

import { useMemo, useState } from 'react';
import { useOwnerKindergarten } from '@features/role-conversion';
import { useStackNavigation } from '@shared/lib/bridge';
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

function useReservationSettingForm() {
  const { back } = useStackNavigation();
  const { basic } = useOwnerKindergarten();
  const [baseline, setBaseline] = useState<ReservationSettingValues>(EMPTY_VALUES);
  const [values, setValues] = useState<ReservationSettingValues>(EMPTY_VALUES);

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
    handleCapacityChange,
    handleSave,
    leaveIfClean,
    handleLeaveWithoutSaving: () => back?.(),
  };
}

export { useReservationSettingForm };
