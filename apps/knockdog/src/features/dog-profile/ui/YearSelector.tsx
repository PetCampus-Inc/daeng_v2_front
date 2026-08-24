'use client';

import { useMemo, useRef, useState } from 'react';

import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
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
  const ignoreNextFocusRef = useRef(false);

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

    closeSheet();
  };

  const closeSheet = () => {
    // 시트가 닫힐 때 트리거로 돌아오는 포커스로 다시 열리지 않도록 한다.
    ignoreNextFocusRef.current = true;
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }

    closeSheet();
  };

  const handleFocus = () => {
    if (ignoreNextFocusRef.current) {
      ignoreNextFocusRef.current = false;
      return;
    }

    setIsOpen(true);
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />

      <div className='flex w-full min-w-0 flex-col'>
        <div className='pb-x2 gap-x0_5 flex items-center'>
          <span className='text-text-primary body2-bold'>태어난 해</span>
          <span className='text-text-tertiary caption1-semibold'>(선택)</span>
        </div>
        <BottomSheet.Trigger asChild>
          <button
            ref={ref as React.Ref<HTMLButtonElement>}
            type='button'
            className={cn(
              'border-line-200 body1-regular text-text-tertiary flex h-[46px] w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 whitespace-nowrap',
              className,
              value && 'text-text-primary'
            )}
            onFocus={handleFocus}
          >
            {value || '태어난 해를 선택해 주세요'}
            <Icon icon='ChevronBottom' className='text-fill-secondary-400 h-5 w-5' />
          </button>
        </BottomSheet.Trigger>
      </div>

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
