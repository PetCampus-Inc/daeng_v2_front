'use client';

import { useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { useBookmarkPostMutation, useBookmarkDeleteMutation } from '../api/useBookmarkMutation';

interface BookmarkToggleIconProps {
  id: string;
  bookmarked: boolean;
}

const BookmarkToggleIcon = ({ id, bookmarked }: BookmarkToggleIconProps) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { mutate: postBookmark } = useBookmarkPostMutation();
  const { mutate: deleteBookmark } = useBookmarkDeleteMutation();

  return (
    <IconButton
      icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'}
      onClick={() => {
        setIsBookmarked(!isBookmarked);
        isBookmarked ? deleteBookmark(id) : postBookmark(id);
      }}
    />
  );
};

export { BookmarkToggleIcon };
