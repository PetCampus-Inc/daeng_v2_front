'use client';

import { useState } from 'react';
import { Textarea, TextareaInput } from '@knockdog/ui';

interface MemoEditorProps {
  initialMemo?: string;
  maxLength?: number;
  onMemoChange?: (memo: string) => void;
  isEditing?: boolean;
  className?: string;
}

export function MemoEditor({
  initialMemo = '',
  maxLength = 2000,
  onMemoChange,
  isEditing = false,
  className = '',
}: MemoEditorProps) {
  const [memo, setMemo] = useState(initialMemo);

  const handleMemoChange = (value: string) => {
    setMemo(value);
    onMemoChange?.(value);
  };

  return (
    <div className={`relative w-fit ${className}`}>
      <div className='body2-regular sticky top-[65px] mb-7 flex items-center justify-center bg-white py-3'>
        <span className='text-text-accent'>{memo.length}</span>
        <span>/{maxLength}</span>
      </div>

      <Textarea cols={5} className='h-[350px] bg-white p-[0]'>
        <TextareaInput
          readOnly={!isEditing}
          value={memo}
          placeholder='메모를 작성해 주세요'
          onChange={(e) => handleMemoChange(e.target.value)}
        />
      </Textarea>
    </div>
  );
}
