'use client';

import { useMemo, useState } from 'react';

import { TextField, TextFieldInput, Icon, BottomSheet } from '@knockdog/ui';

interface YearSelectorProps {
  ref?: React.Ref<HTMLInputElement>;
  className?: string;
  value?: string;
  onBlur?: () => void;
  onChange?: (year: string) => void;
  onComplete?: () => void;
}

export const YearSelector = ({ ref, className, value, onChange, onComplete }: YearSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const yearList = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => {
        const year = new Date().getFullYear() - index;
        return String(year);
      }),
    []
  );

  const handleSelect = (year: string) => () => {
    onChange?.(year);
    onComplete?.();

    setIsOpen(false);
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Overlay className='z-overlay' />

      <BottomSheet.Trigger asChild>
        <TextField
          className={className}
          readOnly
          label='태어난 해'
          value={value}
          indicator='(선택)'
          suffix={<Icon icon='ChevronBottom' />}
        >
          <TextFieldInput
            ref={ref}
            placeholder='년도를 선택해 주세요'
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </TextField>
      </BottomSheet.Trigger>

      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />

        <BottomSheet.Header className='border-line-200 border-b'>
          <BottomSheet.Title>년도 선택</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <div className='px-4'>
          <ul className='scrollbar-hide flex h-[50vh] flex-col overflow-y-auto'>
            {yearList.map((year) => (
              <button
                key={year}
                type='button'
                className='gap-x2 border-line-200 active:text-text-accent flex items-center border-b py-4'
                onClick={handleSelect(year)}
              >
                <li className='body1-medium text-text-primary text-start'>
                  {value === year ? <span className='text-text-accent'>{year}</span> : year}
                </li>
              </button>
            ))}
          </ul>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};
