'use client';

import { useEffect, useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { useBookmarkPostMutation, useBookmarkDeleteMutation } from '../api/useBookmarkMutation';

interface BookmarkToggleIconProps {
  id: string;
  bookmarked: boolean;
}

const BookmarkToggleIcon = ({ id, bookmarked }: BookmarkToggleIconProps) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { mutate: postBookmark, isPending: isPosting } = useBookmarkPostMutation();
  const { mutate: deleteBookmark, isPending: isDeleting } = useBookmarkDeleteMutation();

  useEffect(() => {
    setIsBookmarked(bookmarked);
  }, [bookmarked]);

  const isMutating = isPosting || isDeleting;

  return (
    <IconButton
      icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'}
      disabled={isMutating}
      onClick={(event) => {
        event.stopPropagation();
        // 낙관적 토글
        setIsBookmarked((prev) => !prev);
        isBookmarked ? deleteBookmark(id) : postBookmark(id);
      }}
    />
  );
};

export { BookmarkToggleIcon };
