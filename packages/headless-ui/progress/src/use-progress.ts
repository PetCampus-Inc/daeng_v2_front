import { elementProps } from '@daeng-design/utils';
import { useMemo } from 'react';

export interface UseProgressProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
  getValueText?: (value: number) => string;
}

export type ProgressState = 'complete' | 'loading' | 'indeterminate';

export type UseProgressReturn = ReturnType<typeof useProgress>;

export function useProgress(props: UseProgressProps) {
  const {
    value,
    minValue = 0,
    maxValue = 100,
    getValueText = (p) => `${Math.round(p)}%`,
  } = props;

  const indeterminate = typeof value !== 'number';
  const clamped = useMemo(() => {
    if (indeterminate) return undefined;
    return Math.min(Math.max(value!, minValue), maxValue);
  }, [indeterminate, value, minValue, maxValue]);

  const percent = indeterminate
    ? -1
    : ((clamped! - minValue) / (maxValue - minValue)) * 100;

  const state: ProgressState = indeterminate
    ? 'indeterminate'
    : clamped === maxValue
      ? 'complete'
      : 'loading';

  const stateProps = elementProps({
    'data-progress-state': state,
  });

  const progressProps = elementProps({
    role: 'progressbar',
    'aria-valuemin': minValue,
    'aria-valuemax': maxValue,
    'aria-valuenow': indeterminate ? undefined : clamped,
    'aria-valuetext': indeterminate ? 'loading...' : getValueText(percent),
    ...stateProps,
  });

  return {
    value: clamped,
    minValue,
    maxValue,
    indeterminate,
    percent,
    state,
    stateProps,
    progressProps,
  };
}
