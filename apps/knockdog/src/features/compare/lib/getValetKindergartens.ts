import type { KindergartenComparison, SimpleComparisonItem } from '@entities/compare';
import { mapToSimpleItem } from '@entities/compare';

export function getValetKindergartens(
  left?: KindergartenComparison,
  right?: KindergartenComparison
): SimpleComparisonItem[] {
  if (!left || !right) return [];

  const valetProviders: SimpleComparisonItem[] = [];

  if (left?.service?.includes('PICKDROP')) {
    valetProviders.push(mapToSimpleItem(left));
  }

  if (right?.service?.includes('PICKDROP')) {
    valetProviders.push(mapToSimpleItem(right));
  }

  return valetProviders;
}
