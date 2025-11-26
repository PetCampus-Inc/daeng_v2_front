'use client';

import { useEffect, useMemo, useState } from 'react';
import { BottomSheet, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { RELATIONSHIP, Relationship } from '@entities/pet';

interface RelationshipSelectorProps {
  className?: string;
  value?: Relationship | null;
  autoFocus?: boolean;
  onChange?: (value: Relationship) => void;
  placeholder?: string;
}

function RelationshipSelector({
  className,
  value,
  autoFocus,
  onChange,
  placeholder = '관계 선택',
}: RelationshipSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { label: string; value: Relationship }[] = useMemo(
    () => [
      { label: '엄마', value: RELATIONSHIP.MOTHER },
      { label: '아빠', value: RELATIONSHIP.FATHER },
      { label: '가족', value: RELATIONSHIP.FAMILY },
      { label: '보호자', value: RELATIONSHIP.GUARDIAN },
      { label: '기타', value: RELATIONSHIP.ETC },
    ],
    []
  );

  const handleChange = (value: Relationship) => () => {
    onChange?.(value);
    setIsOpen(false);
  };

  useEffect(() => {
    if (autoFocus) setIsOpen(true);
  }, [autoFocus]);

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Overlay className='z-overlay' />

      <BottomSheet.Trigger asChild>
        <button
          type='button'
          className={cn(
            'border-line-200 body1-regular text-text-tertiary flex h-[46px] w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 whitespace-nowrap',
            className,
            value && 'text-text-primary'
          )}
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <Icon icon='ChevronBottom' className='h-5 w-5' />
        </button>
      </BottomSheet.Trigger>

      <BottomSheet.Body>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-200 justify-between border-b'>
          <BottomSheet.Title>관계 선택</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='px-6'>
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                'body2-semibold flex cursor-pointer items-center justify-between py-4',
                value === option.value && 'text-text-accent'
              )}
              onClick={handleChange(option.value)}
            >
              <label className='flex cursor-pointer items-center gap-x-2' htmlFor={option.value}>
                {option.label}
              </label>
              <input
                type='radio'
                name='relation'
                value={option.value}
                checked={value === option.value}
                onChange={handleChange(option.value)}
                id={option.value}
                className='sr-only'
              />
              <span
                className={cn(
                  'relative m-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-400 transition-colors',
                  value === option.value && 'border-text-accent'
                )}
              >
                {value === option.value && <span className='bg-text-accent block h-3 w-3 rounded-full' />}
              </span>
            </div>
          ))}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { RelationshipSelector };
