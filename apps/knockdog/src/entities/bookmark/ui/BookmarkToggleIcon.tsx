'use client';

import { useEffect, useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { useBookmarkPostMutation, useBookmarkDeleteMutation } from '../api/useBookmarkMutation';

interface BookmarkToggleIconProps {
  id: string;
  bookmarked: boolean;
  className?: string;
}

const BookmarkToggleIcon = ({ id, bookmarked, className = '' }: BookmarkToggleIconProps) => {
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
      className={className}
      disabled={isMutating}
      onClick={(event) => {
        event.stopPropagation();

        if (isBookmarked) {
          deleteBookmark(id, {
            onSuccess: () => {
              setIsBookmarked(false);
            },
          });
        } else {
          postBookmark(id, {
            onSuccess: () => {
              setIsBookmarked(true);
            },
          });
        }
      }}
    />
  );
};

export { BookmarkToggleIcon };
