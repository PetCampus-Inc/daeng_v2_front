import { isAfterDay, isBeforeDay } from '@shared/lib/calendar-date';

type OwnerDailyDayKind = 'past' | 'today' | 'future';

/**
 * 날짜 키(`YYYY-MM-DD`)를 그 날 0시(기기 시간대)의 Date로 바꾼다.
 * 일과 화면은 한국 날짜를 이 값의 연·월·일로만 읽는다.
 */
const createDateFromDateKey = (dateKey: string): Date => {
  const [year = 0, month = 1, day = 1] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** 보고 있는 날짜가 오늘보다 앞인지, 오늘인지, 뒤인지 알려 준다. */
const getOwnerDailyDayKind = (selectedDate: Date, today: Date): OwnerDailyDayKind => {
  if (isBeforeDay(selectedDate, today)) return 'past';
  if (isAfterDay(selectedDate, today)) return 'future';

  return 'today';
};

export {
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getKstDateParts,
  getNextKstMidnightDelay,
} from '@shared/lib/calendar-date';
export { createDateFromDateKey, getOwnerDailyDayKind };
export type { OwnerDailyDayKind };
