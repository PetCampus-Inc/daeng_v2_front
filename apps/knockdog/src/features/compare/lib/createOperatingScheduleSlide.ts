import type { KindergartenComparison, RowData } from '@entities/compare';
import { getClosedDaysText } from '@entities/compare';

export function createOperatingScheduleSlide(
  left: KindergartenComparison | null,
  right: KindergartenComparison | null
): RowData[] {
  const leftSchedule = left?.operatingSchedule;
  const rightSchedule = right?.operatingSchedule;

  return [
    {
      label: '평일',
      left: { value: leftSchedule?.weekdayHours ?? '-' },
      right: { value: rightSchedule?.weekdayHours ?? '-' },
    },
    {
      label: '주말',
      left: { value: leftSchedule?.weekendHours ?? '-' },
      right: { value: rightSchedule?.weekendHours ?? '-' },
    },
    {
      label: '휴무',
      left: { value: getClosedDaysText(left) },
      right: { value: getClosedDaysText(right) },
    },
  ];
}
