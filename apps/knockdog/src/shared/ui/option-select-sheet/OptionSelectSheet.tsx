'use client';

import { useEffect, useRef, useState } from 'react';
import { ActionButton, Icon, RadioGroup, RadioGroupItem } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

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
  listClassName?: string;
}

interface OptionSelectSheetSingleProps extends OptionSelectSheetBaseProps {
  multiple?: false;
  value?: string | null;
  onSelect: (value: string) => void;
  /** 있으면 항목 탭은 임시 선택만 하고, 이 버튼을 눌러야 반영된다. X·바깥 탭은 버린다. */
  confirmLabel?: string;
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
 * - confirmLabel: 항목 탭은 임시 선택, 확인으로 반영하고 X/바깥 탭은 버린다
 * - 복수: 상단 선택 칩 + 목록 토글 (시트 닫을 때까지 유지)
 */
function OptionSelectSheet(props: OptionSelectSheetProps) {
  const { isOpen, close, title, description, options, listClassName } = props;
  const isMultiple = props.multiple === true;
  const confirmLabel = isMultiple ? undefined : props.confirmLabel;
  const listRef = useRef<HTMLDivElement>(null);

  const [draftValues, setDraftValues] = useState<string[]>(
    isMultiple ? orderValuesByOptions(props.values ?? [], options) : []
  );
  const [draftValue, setDraftValue] = useState<string | null>(isMultiple ? null : (props.value ?? null));

  useEffect(() => {
    if (!isOpen || !isMultiple) return;
    setDraftValues(orderValuesByOptions(props.values ?? [], options));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open 시점에만 parent values 동기화
  }, [isOpen, isMultiple]);

  useEffect(() => {
    if (!isOpen || isMultiple || !confirmLabel) return;
    setDraftValue(props.value ?? null);

    const frame = requestAnimationFrame(() => {
      listRef.current?.querySelector('[data-state="checked"]')?.closest('label')?.scrollIntoView({ block: 'center' });
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open 시점에만 parent value 동기화
  }, [isOpen, isMultiple, confirmLabel]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isMultiple) props.onChange(orderValuesByOptions(draftValues, options));
      close();
    }
  };

  const isSelected = (value: string) => {
    if (isMultiple) return draftValues.includes(value);
    if (confirmLabel) return draftValue === value;
    return props.value === value;
  };

  const handleConfirm = () => {
    if (isMultiple || !confirmLabel || !draftValue) return;
    props.onSelect(draftValue);
    close();
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
      <BottomSheet.Body className='z-modal pb-[max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px))]'>
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

        <div ref={listRef} className={cn('max-h-[50vh] overflow-y-auto', listClassName)}>
          {confirmLabel ? (
            <RadioGroup value={draftValue ?? ''} onValueChange={setDraftValue} className='gap-0'>
              {options.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <div key={option.value}>
                    <label className='flex w-full cursor-pointer items-center justify-between px-4 py-4'>
                      <span className={`body1-medium ${selected ? 'text-text-accent' : 'text-text-primary'}`}>
                        {option.label}
                      </span>
                      <RadioGroupItem value={option.value} aria-label={option.label} />
                    </label>
                    <div className='bg-line-200 h-px w-full' />
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            options.map((option) => {
              const selected = isSelected(option.value);
              return (
                <div key={option.value}>
                  <button
                    type='button'
                    onClick={() => (isMultiple ? handleToggle(option.value) : handleSingleSelect(option.value))}
                    className={`body1-medium w-full px-4 py-4 text-left ${
                      selected ? 'text-text-accent' : 'text-text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                  <div className='bg-line-200 h-px w-full' />
                </div>
              );
            })
          )}
        </div>
        {confirmLabel ? (
          <div className='shrink-0 bg-white px-4 py-4'>
            <ActionButton
              type='button'
              size='large'
              variant='primaryFill'
              className='radius-r3'
              disabled={!draftValue}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </ActionButton>
          </div>
        ) : null}
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OptionSelectSheet };
export type { OptionItem, OptionSelectSheetProps };
