import type { KindergartenComparison, SimpleComparisonItem } from '@entities/compare';
import { mapToSimpleItem } from '@entities/compare';

export function getHolidayKindergartens(
  left?: KindergartenComparison,
  right?: KindergartenComparison
): SimpleComparisonItem[] {
  if (!left || !right) return [];

  const holidayOpenKgs: SimpleComparisonItem[] = [];

  const leftClosedDay = left?.operatingSchedule?.closedDays ?? [];
  if (!leftClosedDay?.includes('HOLIDAY')) {
    holidayOpenKgs.push(mapToSimpleItem(left));
  }

  const rightClosedDay = right?.operatingSchedule?.closedDays ?? [];
  if (!rightClosedDay?.includes('HOLIDAY')) {
    holidayOpenKgs.push(mapToSimpleItem(right));
  }

  return holidayOpenKgs;
}
