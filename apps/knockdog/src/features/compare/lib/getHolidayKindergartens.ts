import { KindergartenComparison, mapToSimpleItem, SimpleComparisonItem } from '@entities/compare';

export function getHolidayKindergartens(
  left?: KindergartenComparison,
  right?: KindergartenComparison
): SimpleComparisonItem[] {
  if (!left || !right) return [];

  const holidayOpenKgs: SimpleComparisonItem[] = [];

  if (left?.operatingSchedule?.closedDays?.includes('HOLIDAY')) {
    holidayOpenKgs.push(mapToSimpleItem(left));
  }

  if (right?.operatingSchedule?.closedDays?.includes('HOLIDAY')) {
    holidayOpenKgs.push(mapToSimpleItem(right));
  }

  return holidayOpenKgs;
}
