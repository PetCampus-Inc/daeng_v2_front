'use client';

import { useState } from 'react';

import { ChevronBottom, ChevronTop } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { DiaryPhotoRemove } from '../diary-photo-remove';

const DEFAULT_BODY =
  '안녕하세요 콩이 어머니! 콩이가 오늘 친구들과 운동장에서 아주 활발하게 뛰어놀았어요. 특히 보더콜리 친구와 공놀이하는 걸 무척 좋아하더라고요! 점심도 남김없이 다 먹었고, 오후 낮잠 시간에는 아주 깊게 잠들었습니다. 집에 가서 푹 쉴 수 있게 해주세요!!';

interface DiaryKindergartenNoteProps {
  date?: string;
  body?: string;
  isOpen?: boolean;
  defaultOpen?: boolean;
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
  onRemove?: () => void;
}

/** V4 / Dog Diary / Kindergarten Note */
function DiaryKindergartenNote({
  date = '2026년 6월 17일 수요일',
  body = DEFAULT_BODY,
  isOpen,
  defaultOpen = false,
  className,
  onOpenChange,
  onRemove,
}: DiaryKindergartenNoteProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = isOpen ?? innerOpen;

  function toggleOpen() {
    const nextOpen = !open;
    setInnerOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <article className={cn('bg-bg-50 radius-r2 p-x4 gap-x2 relative flex w-full flex-col items-end', className)}>
      <div className='gap-x2 flex w-full flex-col'>
        <p className='caption1-semibold text-fill-secondary-500'>{date}</p>
        <p className={cn('body2-regular text-text-primary', !open && 'line-clamp-3')}>{body}</p>
      </div>
      <button type='button' onClick={toggleOpen} className='caption1-semibold text-fill-secondary-500 gap-x1 px-x2 py-x1 radius-r1 flex items-center'>
        {open ? '접기' : '더보기'}
        {open ? <ChevronTop className='size-x4' /> : <ChevronBottom className='size-x4' />}
      </button>
      <DiaryPhotoRemove onClick={onRemove} className='absolute top-[-9px] right-[-6px]' />
    </article>
  );
}

export { DiaryKindergartenNote };
export type { DiaryKindergartenNoteProps };
