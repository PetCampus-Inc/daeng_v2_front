'use client';

import { useLayoutEffect, useRef, type ChangeEvent } from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface NoticeMemoTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

/** 알림장 본문: 내용에 맞춰 늘어나고 내부 스크롤 없음 */
function NoticeMemoTextarea({
  value,
  maxLength,
  placeholder,
  onChange,
  readOnly = false,
}: NoticeMemoTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <Textarea variant='default' className='flex flex-col gap-6 overflow-hidden'>
      <TextareaInput
        ref={textareaRef}
        value={value}
        rows={1}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        className={cn('h-auto overflow-hidden', readOnly && 'text-text-secondary')}
      />
      <p className='body2-regular text-text-caption shrink-0'>
        {value.length}/{maxLength}
      </p>
    </Textarea>
  );
}

export { NoticeMemoTextarea };
