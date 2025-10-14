import { Icon } from '@knockdog/ui';
import React from 'react';

interface InputChipProps {
  name: string;
  onClick?: () => void;
  onRemove: () => void;
}

export function InputChip({ name, onClick, onRemove }: InputChipProps) {
  return (
    <div
      onClick={onClick}
      className='py-x2 pl-x3 pr-x2 gap-x2 border-line-200 radius-full flex cursor-pointer items-center border-[1.4]'
    >
      <span className='body2-regular text-text-primary'>{name}</span>
      <button onClick={onRemove} type='button' className='flex cursor-pointer items-center justify-center'>
        <Icon icon='Close' className='size-x5 text-fill-secondary-400' />
      </button>
    </div>
  );
}
