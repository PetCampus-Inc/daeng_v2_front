'use client';

import { useMemo, useState } from 'react';

import { TextField, TextFieldInput, Icon } from '@knockdog/ui';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface YearSelectorProps {
  ref?: React.Ref<HTMLInputElement>;
  className?: string;
  value?: string;
  onBlur?: () => void;
  onChange?: (year: string) => void;
  onComplete?: () => void;
}

const YearSelector = ({ ref, className, value, onChange, onComplete }: YearSelectorProps) => {
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
    const isSelectedYear = value === year;
    onChange?.(isSelectedYear ? '' : year);
    if (!isSelectedYear) onComplete?.();

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
          suffix={<Icon icon='ChevronBottom' className='text-fill-secondary-400' />}
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
        <BottomSheet.Title className='sr-only'>태어난 해 선택</BottomSheet.Title>

        <div className='px-4'>
          <ul className='scrollbar-hide flex h-[50vh] flex-col overflow-y-auto pb-[max(1.25rem,var(--safe-area-inset-bottom,0px))]'>
            {yearList.map((year) => (
              <button
                key={year}
                type='button'
                className='gap-x2 border-line-100 active:text-text-accent flex items-center border-b p-4 last:border-b-0'
                onClick={handleSelect(year)}
              >
                <li className='body1-medium text-text-secondary text-start'>
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

export { YearSelector };
