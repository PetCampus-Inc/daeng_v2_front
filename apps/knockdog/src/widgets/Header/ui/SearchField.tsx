'use client';

import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { useEffect, useRef } from 'react';

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

function SearchField({
  value,
  onChange,
  placeholder = '업체 또는 주소를 검색하세요',
  autoFocus = true,
}: SearchFieldProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 자동 포커스 처리
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    searchInputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className='relative mr-4 min-w-0 flex-1'>
      <TextField
        prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
        className='bg-fill-secondary-50 h-x12 min-w-0 border-0'
      >
        <TextFieldInput
          ref={searchInputRef}
          type='search'
          placeholder={placeholder}
          aria-label='검색어 입력'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              handleSubmit();
            }
          }}
        />
        {value && (
          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            aria-label='검색 결과 초기화'
            className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
          >
            <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
          </button>
        )}
      </TextField>
    </div>
  );
}

export default SearchField;
