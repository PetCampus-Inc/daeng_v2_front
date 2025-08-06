'use client';

import { ToggleButton } from '@knockdog/ui';

interface NeuteredSelectorProps {
  value: boolean | null;
  onChange: (isNeutered: boolean | null) => void;
  required?: boolean;
}

export function NeuteredSelector({
  value,
  onChange,
  required = false,
}: NeuteredSelectorProps) {
  return (
    <div>
      <h5 className='text-text-primary body2-bold pb-2'>
        중성화 여부
        {!required && (
          <span className='caption1-semibold text-text-tertiary'>(선택)</span>
        )}
      </h5>

      <div className='flex gap-x-2'>
        <ToggleButton
          className='flex-1'
          pressed={value === true}
          onPressedChange={() => onChange(true)}
        >
          했어요
        </ToggleButton>
        <ToggleButton
          className='flex-1'
          pressed={value === false}
          onPressedChange={() => onChange(false)}
        >
          안했어요
        </ToggleButton>
      </div>
    </div>
  );
}
