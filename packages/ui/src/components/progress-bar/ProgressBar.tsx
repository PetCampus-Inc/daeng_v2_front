'use client';

import { type Ref } from 'react';
import {
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarRange,
  type ProgressBarRootProps,
} from '@daeng-design/react-progress';

interface ProgressBarProps extends ProgressBarRootProps {
  ref?: Ref<HTMLDivElement>;
}

export function ProgressBar(props: ProgressBarProps) {
  const { totalSteps, value = 0, ref, className, ...restProps } = props;

  return (
    <ProgressBarRoot
      ref={ref}
      minValue={0}
      maxValue={totalSteps}
      totalSteps={totalSteps}
      value={value}
      {...restProps}
      className={`relative flex h-2 gap-2 ${className || ''}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <ProgressBarTrack
          key={index}
          className='bg-fill-secondary-200 flex-1 overflow-hidden rounded-full'
        >
          <ProgressBarRange
            stepIndex={index}
            className='bg-fill-secondary-700 h-full rounded-full'
          />
        </ProgressBarTrack>
      ))}
    </ProgressBarRoot>
  );
}
