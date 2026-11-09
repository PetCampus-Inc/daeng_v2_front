const WEEKDAY_NAME = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;
const CLOSED_WEEKDAY = 0;
const NOON_MINUTES = 12 * 60;
const FULL_MINUTES = new Set([7 * 60, 7 * 60 + 30]);
const RESERVED_MINUTES = 13 * 60 + 30;

const SLOT_MINUTES = [
  7 * 60,
  7 * 60 + 30,
  8 * 60,
  8 * 60 + 30,
  9 * 60,
  9 * 60 + 30,
  10 * 60,
  10 * 60 + 30,
  11 * 60,
  11 * 60 + 30,
  12 * 60,
  12 * 60 + 30,
  13 * 60,
  13 * 60 + 30,
  14 * 60,
  14 * 60 + 30,
  15 * 60,
  15 * 60 + 30,
  16 * 60 + 30,
  17 * 60,
] as const;

interface ScheduleSlot {
  minutes: number;
  label: string;
  isDisabled: boolean;
  isReserved: boolean;
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function dateFromKey(key: string) {
  const [year = '0', month = '1', day = '1'] = key.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(left: Date, right: Date) {
  return toDateKey(left) === toDateKey(right);
}

function minutesOf(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function isClosedDay(date: Date) {
  return date.getDay() === CLOSED_WEEKDAY;
}

function isPastDay(date: Date, today: Date) {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

function isAfterExpiry(date: Date, endsOn: string | null) {
  if (!endsOn) return false;
  return toDateKey(date) > endsOn;
}

function isSlotPast(date: Date, minutes: number, now: Date) {
  if (!isSameDay(date, now)) return false;
  return minutes <= minutesOf(now);
}

function isSlotDisabled(date: Date, minutes: number, now: Date) {
  return FULL_MINUTES.has(minutes) || isSlotPast(date, minutes, now);
}

function hasOpenSlot(date: Date, now: Date) {
  return SLOT_MINUTES.some((minutes) => !isSlotDisabled(date, minutes, now));
}

function shiftOpenDay(date: Date) {
  return date.getDay() === CLOSED_WEEKDAY ? addDays(date, 1) : date;
}

function fullDayKey(today: Date) {
  return toDateKey(shiftOpenDay(addDays(today, 4)));
}

function reservedDateKeys(today: Date, upcomingOn: string | null) {
  const keys = new Set<string>();
  const todayKey = toDateKey(today);
  if (upcomingOn && upcomingOn >= todayKey) keys.add(upcomingOn);
  keys.add(toDateKey(shiftOpenDay(addDays(today, 6))));
  return [...keys];
}

function datesInMonth(month: Date) {
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));
}

function listDisabledDates(month: Date, today: Date, now: Date, endsOn: string | null) {
  const fullOn = fullDayKey(today);

  return datesInMonth(month).filter((date) => {
    const key = toDateKey(date);
    if (isPastDay(date, today) || isClosedDay(date) || isAfterExpiry(date, endsOn)) return true;
    if (key === fullOn) return true;
    return isSameDay(date, today) && !hasOpenSlot(date, now);
  });
}

function formatSlotLabel(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minute = String(minutes % 60).padStart(2, '0');
  return `${String(hour12).padStart(2, '0')}:${minute}`;
}

function listScheduleSlots(date: Date, now: Date, reservedOn: boolean): ScheduleSlot[] {
  return SLOT_MINUTES.map((minutes) => ({
    minutes,
    label: formatSlotLabel(minutes),
    isDisabled: isSlotDisabled(date, minutes, now),
    isReserved: reservedOn && minutes === RESERVED_MINUTES,
  }));
}

function splitScheduleSlots(slots: ScheduleSlot[]) {
  return {
    morning: slots.filter((slot) => slot.minutes < NOON_MINUTES),
    afternoon: slots.filter((slot) => slot.minutes >= NOON_MINUTES),
  };
}

function formatReserveDay(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_NAME[date.getDay()]}`;
}

function formatReserveClock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minute = String(minutes % 60).padStart(2, '0');
  return `${hour < 12 ? '오전' : '오후'} ${hour12}:${minute}`;
}

function formatSelectedPass(placeName: string, totalCount: number, remainingCount: number) {
  return `${placeName} ${totalCount}회권 (${remainingCount}/${totalCount})`;
}

function canContinueReserve(hasDate: boolean, hasTime: boolean) {
  return hasDate && hasTime;
}

export {
  canContinueReserve,
  dateFromKey,
  formatReserveClock,
  formatReserveDay,
  formatSelectedPass,
  fullDayKey,
  listDisabledDates,
  listScheduleSlots,
  reservedDateKeys,
  splitScheduleSlots,
};
export type { ScheduleSlot };
