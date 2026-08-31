'use client';

import { type ChangeEvent, type CompositionEvent, type FormEvent } from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';

import { useFocusScrollLock } from '@shared/lib/device';

interface TemplateContentTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
}

function clampToMaxLength(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/** 템플릿 본문: 세로로만 남은 영역을 채움 (가로는 제목 필드와 동일) */
function TemplateContentTextarea({
  value,
  maxLength,
  placeholder,
  onChange,
}: TemplateContentTextareaProps) {
  const { fieldRef, handleFocus, handleBlur, handlePointerDown } = useFocusScrollLock<HTMLTextAreaElement>();

  const emitChange = (nextValue: string) => {
    onChange(clampToMaxLength(nextValue, maxLength));
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    emitChange(event.target.value);
  };

  const handleBeforeInput = (event: FormEvent<HTMLTextAreaElement>) => {
    const inputEvent = event.nativeEvent as InputEvent;
    if (inputEvent.isComposing) return;

    const data = inputEvent.data;
    if (data == null || data.length === 0) return;

    const target = event.currentTarget;
    const selectionStart = target.selectionStart ?? target.value.length;
    const selectionEnd = target.selectionEnd ?? target.value.length;
    const nextLength = target.value.length - (selectionEnd - selectionStart) + data.length;

    if (nextLength > maxLength) {
      event.preventDefault();
    }
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLTextAreaElement>) => {
    emitChange(event.currentTarget.value);
  };

  return (
    <div className='flex h-full min-h-0 w-full flex-col overscroll-none [&_>div]:flex [&_>div]:h-full [&_>div]:min-h-0 [&_>div]:w-full [&_>div]:flex-col'>
      <Textarea
        variant='secondary'
        className='flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden focus-within:!border-line-200'
      >
        <TextareaInput
          ref={fieldRef}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          onBeforeInput={handleBeforeInput}
          onCompositionEnd={handleCompositionEnd}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck={false}
          className='touch-manipulation !h-auto min-h-0 w-full flex-1 resize-none overflow-y-auto overscroll-contain'
        />
        <p className='body2-regular text-text-caption shrink-0'>
          {value.length}/{maxLength}
        </p>
      </Textarea>
    </div>
  );
}

export { TemplateContentTextarea };
