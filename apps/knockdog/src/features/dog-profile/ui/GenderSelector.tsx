'use client';

import { ToggleButton } from '@knockdog/ui';

interface GenderSelectorProps {
  value?: 'MALE' | 'FEMALE' | null;
  required?: boolean;
  onChange?: (gender: 'MALE' | 'FEMALE' | null) => void;
  onComplete?: () => void;
}

function GenderSelector({ value, required = false, onChange, onComplete }: GenderSelectorProps) {
  const handleChange = (gender: 'MALE' | 'FEMALE' | null) => () => {
    onChange?.(gender);
    onComplete?.();
  };

  return (
    <div>
      <h5 className='text-text-primary body2-bold pb-2'>
        성별
        {!required && <span className='caption1-semibold text-text-tertiary'>(선택)</span>}
      </h5>

      <div className='flex gap-x-2'>
        <ToggleButton
          className='body2-semibold flex-1'
          pressed={value === 'MALE'}
          onPressedChange={handleChange('MALE')}
        >
          남자아이
        </ToggleButton>
        <ToggleButton
          className='body2-semibold flex-1'
          pressed={value === 'FEMALE'}
          onPressedChange={handleChange('FEMALE')}
        >
          여자아이
        </ToggleButton>
      </div>
    </div>
  );
}

export { GenderSelector };
