import { type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

import { DiaryPhotoAdd } from '../diary-photo-add';

interface DiaryPhotoAddItem {
  id: string;
  image: ReactNode;
}

interface DiaryPhotoAddListProps {
  items: DiaryPhotoAddItem[];
  className?: string;
  onRemove?: (id: string) => void;
}

/** V4 / Dog Diary / Photo Add List */
function DiaryPhotoAddList({ items, className, onRemove }: DiaryPhotoAddListProps) {
  return (
    <div className={cn('gap-x4 flex items-start', className)}>
      {items.map((item) => (
        <DiaryPhotoAdd key={item.id} image={item.image} onRemove={() => onRemove?.(item.id)} />
      ))}
    </div>
  );
}

export { DiaryPhotoAddList };
export type { DiaryPhotoAddItem, DiaryPhotoAddListProps };
