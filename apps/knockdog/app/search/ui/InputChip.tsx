import { Icon } from '@knockdog/ui';
import React from 'react';

interface InputChipProps {
  name: string;
}

export function InputChip({ name }: InputChipProps) {
  return (
    <div className='py-x2 pl-x3 pr-x2 gap-x2 border-line-200 radius-full flex items-center border-[1.4]'>
      <div className='size-x6 radius-full overflow-hidden'>
        <img src='https://picsum.photos/200/300' className='h-full w-full' />
      </div>
      <span className='body2-regular text-text-primary'>{name}</span>
      <Icon icon='Close' className='size-x5 text-fill-secondary-400' />
    </div>
  );
}
