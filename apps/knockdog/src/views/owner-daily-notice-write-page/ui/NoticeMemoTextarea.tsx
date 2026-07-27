'use client';

import { useLayoutEffect, useRef, type ChangeEvent } from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';

interface NoticeMemoTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
}

/** 알림장 본문: 내용에 맞춰 늘어나고 내부 스크롤 없음 */
function NoticeMemoTextarea({ value, maxLength, placeholder, onChange }: NoticeMemoTextareaProps) {
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
        className='h-auto overflow-hidden'
      />
      <p className='body2-regular text-text-caption shrink-0'>
        {value.length}/{maxLength}
      </p>
    </Textarea>
  );
}

export { NoticeMemoTextarea };
