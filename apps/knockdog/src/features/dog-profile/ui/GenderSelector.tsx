'use client';

import { ToggleButton } from '@knockdog/ui';

interface GenderSelectorProps {
  value: 'MALE' | 'FEMALE' | null;
  onChange: (gender: 'MALE' | 'FEMALE' | null) => void;
  required?: boolean;
}

export function GenderSelector({ value, onChange, required = false }: GenderSelectorProps) {
  return (
    <div>
      <h5 className='text-text-primary body2-bold pb-2'>
        성별
        {!required && <span className='caption1-semibold text-text-tertiary'>(선택)</span>}
      </h5>

      <div className='flex gap-x-2'>
        <ToggleButton className='flex-1' pressed={value === 'MALE'} onPressedChange={() => onChange('MALE')}>
          남자아이
        </ToggleButton>
        <ToggleButton className='flex-1' pressed={value === 'FEMALE'} onPressedChange={() => onChange('FEMALE')}>
          여자아이
        </ToggleButton>
      </div>
    </div>
  );
}
