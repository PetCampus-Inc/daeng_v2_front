import type { OperationTime } from '@entities/kindergarten';
import { DAY_OF_WEEK, sortDaysOfWeek } from '@shared/constants';

interface OperatingHoursNote {
  hoursLine: string | null;
  closedLine: string | null;
}

function normalizeClock(value?: string | null) {
  if (!value) return null;

  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function formatSlot(slot?: { time: string; breakTime: string }) {
  const start = normalizeClock(slot?.time);
  const end = normalizeClock(slot?.breakTime);
  if (!start || !end) return null;
  return `${start}~${end}`;
}

/** 유치원 기본 정보의 운영시간·휴무. 예약 설정 화면에서는 읽기 전용 */
function formatOperatingHoursNote(operationTime?: OperationTime): OperatingHoursNote {
  if (!operationTime) return { hoursLine: null, closedLine: null };

  const weekday = formatSlot(operationTime.weekday[0]);
  const weekend = formatSlot(operationTime.weekend[0]);
  const hoursLine = [weekday ? `평일 ${weekday}` : null, weekend ? `주말 ${weekend}` : null]
    .filter(Boolean)
    .join(', ');

  const closedLabel = sortDaysOfWeek(operationTime.closedDays)
    .map((day) => DAY_OF_WEEK[day as keyof typeof DAY_OF_WEEK] ?? null)
    .filter(Boolean)
    .join(', ');

  return {
    hoursLine: hoursLine || null,
    closedLine: closedLabel ? `${closedLabel} 휴무` : null,
  };
}

export { formatOperatingHoursNote };
export type { OperatingHoursNote };
