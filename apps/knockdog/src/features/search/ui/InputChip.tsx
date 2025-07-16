import { Icon } from '@knockdog/ui';
import React from 'react';

interface InputChipProps {
  name: string;
  onRemove: () => void;
}

export function InputChip({ name, onRemove }: InputChipProps) {
  return (
    <div className='py-x2 pl-x3 pr-x2 gap-x2 border-line-200 radius-full flex items-center border-[1.4]'>
      <span className='body2-regular text-text-primary'>{name}</span>
      <button
        onClick={onRemove}
        type='button'
        className='flex items-center justify-center'
      >
        <Icon icon='Close' className='size-x5 text-fill-secondary-400' />
      </button>
    </div>
  );
}
