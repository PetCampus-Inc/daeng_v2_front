import { type ReactNode } from 'react';

import { Plus } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { DiaryPhotoRemove } from '../diary-photo-remove';

interface DiaryPhotoAddProps {
  count?: number;
  maxCount?: number;
  image?: ReactNode;
  className?: string;
  onAdd?: () => void;
  onRemove?: () => void;
}

/** V4 / Dog Diary / Photo Add */
function DiaryPhotoAdd({ count = 0, maxCount = 3, image, className, onAdd, onRemove }: DiaryPhotoAddProps) {
  if (!image) {
    return (
      <button
        type='button'
        onClick={onAdd}
        className={cn(
          'bg-bg-0 radius-r2 gap-x1 flex size-[88px] flex-col items-center justify-center border border-solid border-[#d9d9e0]',
          className
        )}
      >
        <Plus className='text-text-caption' />
        <span className='caption1-semibold text-text-caption'>
          {count}/{maxCount}
        </span>
      </button>
    );
  }

  return (
    <div className={cn('bg-bg-0 radius-r2 relative size-[88px]', className)}>
      <div className='radius-r2 size-full overflow-hidden'>{image}</div>
      <DiaryPhotoRemove onClick={onRemove} className='absolute top-[-6px] right-[-6px]' />
    </div>
  );
}

export { DiaryPhotoAdd };
export type { DiaryPhotoAddProps };
