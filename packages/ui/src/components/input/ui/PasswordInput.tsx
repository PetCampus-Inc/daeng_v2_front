'use client';

// import { IconButton } from '../../icon-button';

import { Input, type InputProps } from './Input';
import { usePasswordToggle } from '../hooks/usePasswordToggle';

export const PasswordInput = ({ ...props }: InputProps) => {
  const { inputType, isShowPassword, handleTogglePassword } =
    usePasswordToggle();

  return (
    <Input
      type={inputType}
      inputMode='text'
      // suffixElement={
      //   <IconButton
      //     className='mx-1'
      //     iconClassName='size-4'
      //     icon={isShowPassword ? 'EyesClosed' : 'EyesOpened'}
      //     pressEffect
      //     onClick={handleTogglePassword}
      //   />
      // }
      {...props}
    />
  );
};
