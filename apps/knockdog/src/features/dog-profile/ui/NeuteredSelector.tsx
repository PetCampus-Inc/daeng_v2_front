'use client';

import { ToggleButton } from '@knockdog/ui';

interface NeuteredSelectorProps {
  value?: 'Y' | 'N' | null;
  required?: boolean;
  onChange?: (isNeutered: 'Y' | 'N' | null) => void;
  onComplete?: () => void;
}

export function NeuteredSelector({ value, required = false, onChange, onComplete }: NeuteredSelectorProps) {
  const handleChange = (isNeutered: 'Y' | 'N') => () => {
    onChange?.(isNeutered);
    onComplete?.();
  };

  return (
    <div>
      <h5 className='text-text-primary body2-bold pb-2'>
        중성화 여부
        {!required && <span className='caption1-semibold text-text-tertiary'>(선택)</span>}
      </h5>

      <div className='flex gap-x-2'>
        <ToggleButton className='flex-1' pressed={value === 'Y'} onPressedChange={handleChange('Y')}>
          했어요
        </ToggleButton>
        <ToggleButton className='flex-1' pressed={value === 'N'} onPressedChange={handleChange('N')}>
          안했어요
        </ToggleButton>
      </div>
    </div>
  );
}
