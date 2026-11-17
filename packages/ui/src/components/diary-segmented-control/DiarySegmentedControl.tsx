'use client';

import { useState } from 'react';

import { cn } from '@knockdog/ui/lib';

const DIARY_SEGMENT = {
  kindergarten: 'kindergarten',
  diary: 'diary',
} as const;

type DiarySegment = keyof typeof DIARY_SEGMENT;

const DIARY_SEGMENT_LABEL = {
  kindergarten: '유치원',
  diary: '일기장',
} as const;

interface DiarySegmentedControlProps {
  value?: DiarySegment;
  defaultValue?: DiarySegment;
  hasBadge?: boolean;
  className?: string;
  onValueChange?: (value: DiarySegment) => void;
}

/** V4 / Dog Diary / Segmented Control */
function DiarySegmentedControl({
  value,
  defaultValue = 'kindergarten',
  hasBadge = false,
  className,
  onValueChange,
}: DiarySegmentedControlProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selected = value ?? innerValue;

  function selectSegment(nextValue: DiarySegment) {
    setInnerValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <div role='tablist' className={cn('bg-bg-100 radius-full p-x1 gap-x1 flex w-full', className)}>
      {(Object.keys(DIARY_SEGMENT) as DiarySegment[]).map((segment) => {
        const isSelected = selected === segment;

        return (
          <button
            key={segment}
            type='button'
            role='tab'
            aria-selected={isSelected}
            onClick={() => selectSegment(segment)}
            className={cn(
              'body2-bold radius-full py-x2 gap-x1 flex flex-1 items-center justify-center',
              isSelected ? 'bg-bg-0 text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.06)]' : 'text-fill-secondary-500'
            )}
          >
            {DIARY_SEGMENT_LABEL[segment]}
            {hasBadge && segment === 'kindergarten' ? <span className='bg-fill-primary-500 size-[5px] rounded-full' /> : null}
          </button>
        );
      })}
    </div>
  );
}

export { DiarySegmentedControl, DIARY_SEGMENT };
export type { DiarySegment, DiarySegmentedControlProps };
