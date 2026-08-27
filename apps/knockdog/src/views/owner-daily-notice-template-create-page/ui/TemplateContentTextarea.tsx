'use client';

import { type ChangeEvent } from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';

interface TemplateContentTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
}

/** 템플릿 본문: 세로로만 남은 영역을 채움 (가로는 제목 필드와 동일) */
function TemplateContentTextarea({
  value,
  maxLength,
  placeholder,
  onChange,
}: TemplateContentTextareaProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value.slice(0, maxLength));
  };

  return (
    <div className='flex h-full min-h-0 w-full flex-col [&_>div]:flex [&_>div]:h-full [&_>div]:min-h-0 [&_>div]:w-full [&_>div]:flex-col'>
      <Textarea
        variant='secondary'
        className='flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden focus-within:!border-line-200'
      >
        <TextareaInput
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          spellCheck={false}
          className='!h-auto min-h-0 w-full flex-1 resize-none overflow-y-auto'
        />
        <p className='body2-regular text-text-caption shrink-0'>
          {value.length}/{maxLength}
        </p>
      </Textarea>
    </div>
  );
}

export { TemplateContentTextarea };
