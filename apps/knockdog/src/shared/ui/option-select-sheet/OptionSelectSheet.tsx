'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@knockdog/ui';

import { BottomSheet } from '@shared/ui/bottom-sheet';

interface OptionItem {
  value: string;
  label: string;
}

interface OptionSelectSheetBaseProps {
  isOpen: boolean;
  close: () => void;
  title: string;
  description?: string;
  options: OptionItem[];
}

interface OptionSelectSheetSingleProps extends OptionSelectSheetBaseProps {
  multiple?: false;
  value?: string | null;
  onSelect: (value: string) => void;
}

interface OptionSelectSheetMultipleProps extends OptionSelectSheetBaseProps {
  multiple: true;
  values?: string[];
  onChange: (values: string[]) => void;
}

type OptionSelectSheetProps = OptionSelectSheetSingleProps | OptionSelectSheetMultipleProps;

/** 선택값을 options 나열 순으로 정렬 (휴무일: 월→일) */
function orderValuesByOptions(values: string[], options: OptionItem[]) {
  const order = options.map((option) => option.value);

  return [...values].sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return aRank - bRank;
  });
}

/**
 * 단일/복수 선택 공용 바텀시트.
 * - 단일: 항목 탭 즉시 선택 후 close
 * - 복수: 상단 선택 칩 + 목록 토글 (시트 닫을 때까지 유지)
 */
function OptionSelectSheet(props: OptionSelectSheetProps) {
  const { isOpen, close, title, description, options } = props;
  const isMultiple = props.multiple === true;

  const [draftValues, setDraftValues] = useState<string[]>(
    isMultiple ? orderValuesByOptions(props.values ?? [], options) : []
  );

  useEffect(() => {
    if (!isOpen || !isMultiple) return;
    setDraftValues(orderValuesByOptions(props.values ?? [], options));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open 시점에만 parent values 동기화
  }, [isOpen, isMultiple]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isMultiple) props.onChange(orderValuesByOptions(draftValues, options));
      close();
    }
  };

  const isSelected = (value: string) => {
    if (isMultiple) return draftValues.includes(value);
    return props.value === value;
  };

  const handleSingleSelect = (value: string) => {
    if (isMultiple) return;
    props.onSelect(value);
    close();
  };

  const handleToggle = (value: string) => {
    setDraftValues((prev) =>
      orderValuesByOptions(
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
        options
      )
    );
  };

  const handleRemoveChip = (value: string) => {
    setDraftValues((prev) => prev.filter((item) => item !== value));
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-start justify-between'>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <BottomSheet.Title>{title}</BottomSheet.Title>
            {description ? (
              <p className='body2-regular text-text-secondary'>{description}</p>
            ) : null}
          </div>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        {isMultiple && draftValues.length > 0 ? (
          <div className='scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-5'>
            {draftValues.map((value) => {
              const label = options.find((option) => option.value === value)?.label ?? value;
              return (
                <button
                  key={value}
                  type='button'
                  onClick={() => handleRemoveChip(value)}
                  className='radius-full border-line-200 body2-regular text-text-primary flex shrink-0 items-center gap-1 border-[1.4px] py-[9px] pr-2 pl-3'
                >
                  {label}
                  <Icon icon='Close' className='text-fill-secondary-400 size-5' aria-hidden />
                </button>
              );
            })}
          </div>
        ) : null}

        <div className='max-h-[50vh] overflow-y-auto'>
          {options.map((option) => {
            const selected = isSelected(option.value);
            return (
              <div key={option.value}>
                <button
                  type='button'
                  onClick={() =>
                    isMultiple ? handleToggle(option.value) : handleSingleSelect(option.value)
                  }
                  className={`body1-medium w-full px-4 py-4 text-left ${
                    selected ? 'text-text-accent' : 'text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
                <div className='bg-line-200 h-px w-full' />
              </div>
            );
          })}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OptionSelectSheet };
export type { OptionItem, OptionSelectSheetProps };
