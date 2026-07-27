'use client';

import { useLayoutEffect, useRef, type ChangeEvent } from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';

const LINE_HEIGHT_PX = 24;
const MAX_LINES = 2;
const MAX_HEIGHT_PX = LINE_HEIGHT_PX * MAX_LINES;

interface ShortMemoTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
}

/** 50자 내외 짧은 메모: 최대 2줄까지 늘어나고 내부 스크롤 없음 */
function ShortMemoTextarea({ value, maxLength, placeholder, onChange }: ShortMemoTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <Textarea variant='default' className='overflow-hidden'>
      <TextareaInput
        ref={textareaRef}
        value={value}
        rows={1}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={handleChange}
        className='h-auto max-h-[48px] overflow-hidden'
      />
    </Textarea>
  );
}

export { ShortMemoTextarea };
