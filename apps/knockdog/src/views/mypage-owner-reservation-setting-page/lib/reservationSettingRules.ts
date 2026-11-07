import type { AdmissionTimeField } from '@views/mypage-owner-reservation-setting-page/config/timeOptions';

const TIME_ORDER_ERROR = '시작 시간은 종료 시간보다 빨라야 해요';

interface ReservationSettingValues {
  weekdayStart: string | null;
  weekdayEnd: string | null;
  weekendStart: string | null;
  weekendEnd: string | null;
  dailyCapacity: string;
}

const EMPTY_RESERVATION_SETTING: ReservationSettingValues = {
  weekdayStart: null,
  weekdayEnd: null,
  weekendStart: null,
  weekendEnd: null,
  dailyCapacity: '',
};

function timeOrderError(start: string | null, end: string | null) {
  if (!start || !end || start < end) return null;
  return TIME_ORDER_ERROR;
}

/** 시작과 끝은 둘 다 있거나 둘 다 없어야 한다. */
function isTimePairComplete(start: string | null, end: string | null) {
  return Boolean(start) === Boolean(end);
}

function capacityLimitError(value: string, peak: number | null) {
  if (!value) return null;

  const count = Number(value);
  if (!Number.isInteger(count) || count < 1) return '하루 정원은 1마리 이상이어야 해요.';
  if (peak == null || count >= peak) return null;
  return `하루 ${peak}마리가 예약된 날이 있어 ${peak}마리보다 적게 정할 수 없어요.`;
}

function sanitizeDailyCapacity(value: string) {
  return value.replace(/\D/g, '').slice(0, 3);
}

/** origin과 다른 칸은 편집으로 보고 current를 남긴다. 같은 칸은 next로 바꾼다. */
function keepUnsavedReservationEdits(
  origin: ReservationSettingValues,
  current: ReservationSettingValues,
  next: ReservationSettingValues
): ReservationSettingValues {
  return {
    weekdayStart: current.weekdayStart === origin.weekdayStart ? next.weekdayStart : current.weekdayStart,
    weekdayEnd: current.weekdayEnd === origin.weekdayEnd ? next.weekdayEnd : current.weekdayEnd,
    weekendStart: current.weekendStart === origin.weekendStart ? next.weekendStart : current.weekendStart,
    weekendEnd: current.weekendEnd === origin.weekendEnd ? next.weekendEnd : current.weekendEnd,
    dailyCapacity: current.dailyCapacity === origin.dailyCapacity ? next.dailyCapacity : current.dailyCapacity,
  };
}

function isSameReservationSetting(left: ReservationSettingValues, right: ReservationSettingValues) {
  return (
    left.weekdayStart === right.weekdayStart &&
    left.weekdayEnd === right.weekdayEnd &&
    left.weekendStart === right.weekendStart &&
    left.weekendEnd === right.weekendEnd &&
    left.dailyCapacity === right.dailyCapacity
  );
}

function canSaveReservationSetting(
  values: ReservationSettingValues,
  baseline: ReservationSettingValues,
  peak: number | null
) {
  const isDirty = !isSameReservationSetting(values, baseline);
  const hasFieldError = Boolean(
    timeOrderError(values.weekdayStart, values.weekdayEnd) ||
      timeOrderError(values.weekendStart, values.weekendEnd) ||
      capacityLimitError(values.dailyCapacity, peak)
  );
  const hasIncompleteTimePair =
    !isTimePairComplete(values.weekdayStart, values.weekdayEnd) ||
    !isTimePairComplete(values.weekendStart, values.weekendEnd);

  return isDirty && !hasFieldError && !hasIncompleteTimePair;
}

/** 확인한 칸만 바꾼다. 반대편 시간은 그대로 둔다. */
function applyConfirmedTime(values: ReservationSettingValues, field: AdmissionTimeField, value: string) {
  return { ...values, [field]: value };
}

export {
  EMPTY_RESERVATION_SETTING,
  applyConfirmedTime,
  canSaveReservationSetting,
  capacityLimitError,
  isSameReservationSetting,
  keepUnsavedReservationEdits,
  sanitizeDailyCapacity,
  timeOrderError,
};
export type { ReservationSettingValues };
