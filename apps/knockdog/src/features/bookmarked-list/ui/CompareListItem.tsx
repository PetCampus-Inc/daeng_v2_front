'use client';

import { Checkbox } from '@knockdog/ui';
import { BookmarkedListItem } from './BookmarkedListItem';
import type { BookmarkItem } from '@entities/bookmark';

interface CompareListItemProps {
  kindergarten: BookmarkItem;
  isSelected: boolean;
  distanceText: string;
  onToggle: (checked: boolean) => void;
  onClick?: () => void;
}

function CompareListItem({ kindergarten, isSelected, onToggle, onClick, distanceText }: CompareListItemProps) {
  return (
    <div className='flex items-start gap-3 bg-white py-5'>
      <Checkbox size='sm' checked={isSelected} onCheckedChange={onToggle} />
      <BookmarkedListItem
        kindergarten={kindergarten}
        distanceText={distanceText}
        bookmarkDisabled
        className='p-0'
        onClick={onClick}
      />
    </div>
  );
}

export { CompareListItem };
