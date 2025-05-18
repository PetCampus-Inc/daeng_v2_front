'use client';

import { IconButton } from '../../icon-button';
import { Input, type InputProps } from './Input';

export interface SearchInputProps extends InputProps {
  onClear?: () => void;
}

export const SearchInput = ({ value, onClear, ...props }: SearchInputProps) => {
  return (
    <Input
      type='search'
      inputMode='search'
      value={value}
      suffixElement={
        value ? (
          <IconButton
            className='mx-1'
            icon='Search'
            pressEffect
            onClick={onClear}
          />
        ) : (
          <IconButton className='mx-1' icon='Search' />
        )
      }
      {...props}
    />
  );
};
