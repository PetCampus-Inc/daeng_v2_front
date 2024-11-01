'use client';

import { InputHTMLAttributes } from 'react';
import { Icon } from '../icon';

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string; // 필수로 변경 가능
}

const CheckBox = ({
  label,
  checked = false,
  onChange,
  id,
  ...restProps
}: CheckBoxProps) => {
  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          checked: !checked,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className='flex w-fit items-center'>
      <input
        id={id}
        type='checkbox'
        checked={checked}
        onChange={onChange}
        className='hidden'
        {...restProps}
      />
      <div className='inline cursor-pointer' onClick={handleIconClick}>
        <Icon
          className='inline'
          icon={checked ? 'CircleCheckOn' : 'CircleCheckOff'}
        />
      </div>
      <label htmlFor={id} className='ml-2 cursor-pointer'>
        {label}
      </label>
    </div>
  );
};

export { CheckBox };
