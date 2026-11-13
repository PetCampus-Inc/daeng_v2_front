import { formatDateKey, isAfterDay, startOfDay } from '@shared/lib/calendar-date';

interface GuardianDiaryEntry {
  dateKey: string;
  title: string;
  body: string;
  photoCount: number;
  imageSrc?: string;
}

const DIARY_WEEKDAY_LABEL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;
const DIARY_CREDIT_LIMIT = 3;

type DiaryDayKind = 'written' | 'today' | 'past' | 'spent';

function findDiaryEntry(entries: GuardianDiaryEntry[], date: Date) {
  const dateKey = formatDateKey(date);
  return entries.find((entry) => entry.dateKey === dateKey);
}

function resolveDiaryDayKind(hasEntry: boolean, isToday: boolean, remainingCredits: number): DiaryDayKind {
  if (hasEntry) return 'written';
  if (remainingCredits <= 0) return 'spent';
  if (isToday) return 'today';
  return 'past';
}

function alignDiaryDateToMonth(month: Date, selected: Date, today: Date) {
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const day = Math.min(selected.getDate(), lastDay);
  const next = startOfDay(new Date(month.getFullYear(), month.getMonth(), day));
  if (isAfterDay(next, today)) return startOfDay(today);
  return next;
}

function formatDiaryWeekday(date: Date) {
  return DIARY_WEEKDAY_LABEL[date.getDay()];
}

export { DIARY_CREDIT_LIMIT, alignDiaryDateToMonth, findDiaryEntry, formatDiaryWeekday, resolveDiaryDayKind };
export type { DiaryDayKind, GuardianDiaryEntry };
