'use client';

import { useRef, useState } from 'react';
import { Textarea, TextareaInput } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { countMemoCharacters, MEMO_MAX_CONTENT_LENGTH, truncateMemoContent } from '@entities/memo';

interface MemoEditorProps {
  defaultValue?: string;
  maxLength?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;

  readOnly?: boolean;
}

export function MemoEditor({
  defaultValue = '',
  maxLength = MEMO_MAX_CONTENT_LENGTH,
  value,
  onChange,
  className = '',
  readOnly,
}: MemoEditorProps) {
  const [memo, setMemo] = useState(defaultValue);
  const isComposingRef = useRef(false);
  const currentValue = (value !== undefined ? value : memo) ?? '';

  const commitTruncatedValue = (target: HTMLTextAreaElement) => {
    const newValue = truncateMemoContent(target.value, maxLength);
    target.value = newValue;
    setMemo(newValue);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isComposingRef.current) {
      setMemo(e.target.value);
      onChange?.(e);
      return;
    }

    commitTruncatedValue(e.target);
    onChange?.(e);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposingRef.current = false;
    commitTruncatedValue(e.currentTarget);
    onChange?.({
      ...e,
      target: e.currentTarget,
      currentTarget: e.currentTarget,
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className={cn('relative', className)}>
      <div className='body2-regular sticky top-[65px] mb-7 flex items-center justify-center bg-white py-3'>
        <span className='text-text-accent'>{countMemoCharacters(currentValue)}</span>
        <span>/{maxLength}</span>
      </div>

      <Textarea cols={5} className='h-[350px] bg-white p-0'>
        <TextareaInput
          readOnly={readOnly}
          value={currentValue}
          placeholder='메모를 작성해 주세요'
          onChange={handleMemoChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </Textarea>
    </div>
  );
}
